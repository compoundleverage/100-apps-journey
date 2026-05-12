import type { APIRoute } from "astro";
import Anthropic from "@anthropic-ai/sdk";
import {
  loadMentor,
  loadAllMentors,
  loadIdea,
  composeChatSystemPrompt,
  buildIdeaContext,
  toAnthropicMessages,
  encodeNDJSON,
} from "../../../../lib/chat/server";
import type { ChatMessage } from "../../../../lib/chat/types";

export const prerender = false;

const MAX_TURNS = 20;
const MAX_TOKENS = 600; // tight to stay within Vercel Hobby 10s streaming budget
const MODEL = "claude-sonnet-4-6";

export const POST: APIRoute = async ({ params, request }) => {
  try {
    return await handle(params, request);
  } catch (e: unknown) {
    // Top-level safety net: any uncaught throw (filesystem, parse, network)
    // returns a useful body so client.streamChat surfaces it via the error
    // event — instead of a Vercel-wrapped opaque "Internal Server Error".
    const msg = e instanceof Error ? `${e.message}\n${e.stack ?? ""}` : String(e);
    console.error("[chat/1on1] uncaught:", msg);
    return new Response(`server error: ${msg}`.slice(0, 1000), { status: 500 });
  }
};

async function handle(
  params: Record<string, string | undefined>,
  request: Request,
): Promise<Response> {
  const mentorSlug = params.mentor;
  if (!mentorSlug) return new Response("Missing mentor slug", { status: 400 });

  const apiKey = request.headers.get("x-user-anthropic-key")?.trim();
  if (!apiKey || !apiKey.startsWith("sk-ant-")) {
    return new Response("Missing or malformed X-User-Anthropic-Key header", { status: 401 });
  }

  let body: { ideaId?: string; history?: ChatMessage[] };
  try {
    body = await request.json();
  } catch {
    return new Response("Body must be JSON", { status: 400 });
  }
  const { ideaId, history = [] } = body;
  if (!ideaId) return new Response("Missing ideaId", { status: 400 });
  if (history.length > MAX_TURNS * 2) {
    return new Response(`Conversation cap (${MAX_TURNS} user turns) reached`, { status: 429 });
  }

  const [mentor, idea, allMentors] = await Promise.all([
    loadMentor(mentorSlug),
    loadIdea(ideaId),
    loadAllMentors(),
  ]);
  if (!mentor) return new Response(`No mentor "${mentorSlug}"`, { status: 404 });
  if (!idea) return new Response(`No idea "${ideaId}"`, { status: 404 });

  const mentorByName = new Map(allMentors.map((m) => [m.slug, m]));
  const systemPrompt = composeChatSystemPrompt(mentor, "1on1");
  const ideaContext = buildIdeaContext(idea);

  // First user turn always gets idea context prepended.
  const messages = [
    { role: "user" as const, content: ideaContext },
    ...toAnthropicMessages(history, mentor, "1on1", mentorByName),
  ];

  // If history has no user message yet, prompt the mentor for an opening question.
  if (history.length === 0) {
    messages.push({
      role: "user" as const,
      content:
        "Open the conversation with one sharp forcing question — pick the dimension where you have the most doubt about this idea.",
    });
  }

  const client = new Anthropic({ apiKey });

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const apiStream = await client.messages.stream({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
          messages,
        });

        for await (const event of apiStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encodeNDJSON({ type: "delta", text: event.delta.text }));
          }
        }

        const final = await apiStream.finalMessage();
        const u = final.usage as Record<string, number | undefined>;
        controller.enqueue(
          encodeNDJSON({
            type: "done",
            usage: {
              input_tokens: u?.input_tokens,
              output_tokens: u?.output_tokens,
              cache_read_input_tokens: u?.cache_read_input_tokens,
              cache_creation_input_tokens: u?.cache_creation_input_tokens,
            },
          }),
        );
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        controller.enqueue(encodeNDJSON({ type: "error", message: msg.replace(apiKey, "<redacted>") }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
