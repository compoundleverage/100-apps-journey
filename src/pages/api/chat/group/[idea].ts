import type { APIRoute } from "astro";
import Anthropic from "@anthropic-ai/sdk";
import {
  loadAllMentors,
  loadIdea,
  composeChatSystemPrompt,
  buildIdeaContext,
  toAnthropicMessages,
  encodeNDJSON,
  type MentorRecord,
} from "../../../../lib/chat/server";
import type { ChatMessage } from "../../../../lib/chat/types";

export const prerender = false;

const MODEL = "claude-sonnet-4-6";
const MAX_TURNS = 25; // total turns including opening pass
const MAX_TOKENS_OPENING = 350;
const MAX_TOKENS_TURN = 500;

/**
 * Group panel discussion orchestrator.
 *
 * Two phases per request:
 *   1. If history has no mentor turns yet → fan-out: each mentor weighs in
 *      with a one-paragraph opening take. Stream each as it completes.
 *   2. Otherwise → orchestrator picks the next speaker:
 *      - If the user @-mentioned a name in their last message, that mentor speaks
 *      - Else: meta-prompt asks Claude (cheap haiku) to pick the mentor whose
 *        view diverges most from what's been said
 *      Stream that mentor's turn.
 */
export const POST: APIRoute = async ({ params, request }) => {
  const ideaId = params.idea;
  if (!ideaId) return new Response("Missing idea", { status: 400 });

  const apiKey = request.headers.get("x-user-anthropic-key")?.trim();
  if (!apiKey || !apiKey.startsWith("sk-ant-")) {
    return new Response("Missing or malformed X-User-Anthropic-Key header", { status: 401 });
  }

  let body: { history?: ChatMessage[] };
  try {
    body = await request.json();
  } catch {
    return new Response("Body must be JSON", { status: 400 });
  }
  const history = body.history ?? [];
  if (history.length > MAX_TURNS) {
    return new Response(`Discussion cap (${MAX_TURNS} turns) reached`, { status: 429 });
  }

  const [allMentors, idea] = await Promise.all([loadAllMentors(), loadIdea(ideaId)]);
  if (!idea) return new Response(`No idea "${ideaId}"`, { status: 404 });

  const mentorByName = new Map(allMentors.map((m) => [m.slug, m]));
  const ideaCtx = buildIdeaContext(idea);
  const client = new Anthropic({ apiKey });

  const hasMentorTurns = history.some((m) => m.role === "mentor");

  if (!hasMentorTurns) {
    // OPENING PASS — every mentor weighs in. Stream them serially so the
    // ordering is deterministic and the client sees one mentor finish before
    // the next begins. Each gets `speaker` event + own delta stream.
    return openingPassResponse(client, allMentors, ideaCtx, history, mentorByName);
  }

  // FOLLOW-UP: orchestrator picks who speaks next.
  return followupTurnResponse(client, allMentors, ideaCtx, history, mentorByName);
};

function openingPassResponse(
  client: Anthropic,
  mentors: MentorRecord[],
  ideaCtx: string,
  history: ChatMessage[],
  mentorByName: Map<string, MentorRecord>,
): Response {
  // Allow user-prefacing text in history[0]
  const userIntro = history.find((m) => m.role === "user")?.text;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for (const mentor of mentors) {
          // Announce the speaker
          controller.enqueue(encodeNDJSON({ type: "delta", text: "" })); // ensure flushing buffer
          // We use a custom intermediate "speaker" hint: we send a `done`-style
          // event WITHOUT closing, then a separate stream for that mentor's text.
          // To keep the wire format simple, use {type:"delta", text:""} as a no-op;
          // the speaker attribution happens via the trailing {type:"done", speaker}.

          const sysPrompt = composeChatSystemPrompt(mentor, "group");
          const msgs = toAnthropicMessages(history, mentor, "group", mentorByName);
          const userTurn = userIntro
            ? `${ideaCtx}\n\n---\n\nThe proposer's framing: ${userIntro}\n\nGive YOUR opening take in ≤ 4 sentences. Use ONE forcing question.`
            : `${ideaCtx}\n\n---\n\nGive YOUR opening take on this idea in ≤ 4 sentences. Pick the dimension where you have the most doubt and ask ONE forcing question.`;

          const apiStream = await client.messages.stream({
            model: MODEL,
            max_tokens: MAX_TOKENS_OPENING,
            system: [{ type: "text", text: sysPrompt, cache_control: { type: "ephemeral" } }],
            messages: [...msgs, { role: "user" as const, content: userTurn }],
          });

          let buffer = "";
          for await (const ev of apiStream) {
            if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
              buffer += ev.delta.text;
              controller.enqueue(encodeNDJSON({ type: "delta", text: ev.delta.text }));
            }
          }
          // Speaker attribution — closes this mentor's turn
          controller.enqueue(encodeNDJSON({ type: "done", speaker: mentor.slug }));
          // Reset client-side: a small no-op will tell the client to start a new mentor stub
          // (the client uses the `done` event with `speaker` as the trigger to commit + open new stub)
        }
        // Final close marker after all mentors
        controller.enqueue(encodeNDJSON({ type: "done" }));
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        controller.enqueue(encodeNDJSON({ type: "error", message: msg }));
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

async function followupTurnResponse(
  client: Anthropic,
  mentors: MentorRecord[],
  ideaCtx: string,
  history: ChatMessage[],
  mentorByName: Map<string, MentorRecord>,
): Promise<Response> {
  // Step 1: pick speaker
  let chosen: MentorRecord | null = null;
  const lastUser = [...history].reverse().find((m) => m.role === "user");
  if (lastUser) {
    // @-mention?
    const mention = matchMention(lastUser.text, mentors);
    if (mention) chosen = mention;
  }
  if (!chosen) {
    chosen = await pickByDisagreement(client, mentors, history, ideaCtx);
  }
  if (!chosen) chosen = mentors[0]; // safety fallback

  const sysPrompt = composeChatSystemPrompt(chosen, "group");
  const msgs = toAnthropicMessages(history, chosen, "group", mentorByName);

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const apiStream = await client.messages.stream({
          model: MODEL,
          max_tokens: MAX_TOKENS_TURN,
          system: [{ type: "text", text: sysPrompt, cache_control: { type: "ephemeral" } }],
          messages: [
            { role: "user" as const, content: ideaCtx },
            ...msgs,
            // Final nudge prompting THIS mentor to speak based on the room state
            {
              role: "user" as const,
              content:
                "It's your turn in the panel discussion. Build on, push back against, or correct what's been said — but only from YOUR distinct lens. Two to four sentences. End with a question or a forced choice for the proposer.",
            },
          ],
        });
        for await (const ev of apiStream) {
          if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
            controller.enqueue(encodeNDJSON({ type: "delta", text: ev.delta.text }));
          }
        }
        controller.enqueue(encodeNDJSON({ type: "done", speaker: chosen!.slug }));
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        controller.enqueue(encodeNDJSON({ type: "error", message: msg }));
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

function matchMention(text: string, mentors: MentorRecord[]): MentorRecord | null {
  const m = text.match(/@(\S+)/);
  if (!m) return null;
  const tag = m[1].toLowerCase();
  // Match by slug, name first word, or initials.
  return (
    mentors.find((mt) => mt.slug.toLowerCase() === tag) ||
    mentors.find((mt) => mt.name.toLowerCase().split(" ")[0] === tag) ||
    mentors.find((mt) => mt.avatar_initials.toLowerCase() === tag) ||
    null
  );
}

async function pickByDisagreement(
  client: Anthropic,
  mentors: MentorRecord[],
  history: ChatMessage[],
  ideaCtx: string,
): Promise<MentorRecord | null> {
  const transcript = history
    .map((m) => {
      const who =
        m.role === "user"
          ? "Proposer"
          : mentors.find((x) => x.slug === m.mentor)?.name ?? m.mentor ?? "Mentor";
      return `${who}: ${m.text}`;
    })
    .join("\n\n");

  const list = mentors
    .map((m) => `- ${m.slug}: ${m.name} — ${m.short_bio.slice(0, 100)}`)
    .join("\n");

  const sys = `You are an impartial panel moderator. Given an idea, a transcript of a panel discussion, and a roster of mentors, pick which ONE mentor should speak next. The criterion is "whose distinct lens would add the most divergence or sharpest pushback to the current state of the discussion." Avoid picking the mentor who just spoke. Avoid picking someone who already echoed what's been said.

Output strict JSON only: {"mentor": "<slug>"}`;
  const user = `Idea: ${ideaCtx.slice(0, 600)}

Roster:
${list}

Transcript so far:
${transcript.slice(-3000)}

Pick next.`;

  try {
    const res = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 60,
      system: sys,
      messages: [{ role: "user", content: user }],
    });
    const txt =
      (res.content.find((c) => c.type === "text") as { text?: string } | undefined)?.text ?? "";
    const start = txt.indexOf("{");
    const end = txt.lastIndexOf("}");
    if (start === -1 || end === -1) return null;
    const parsed = JSON.parse(txt.slice(start, end + 1)) as { mentor?: string };
    if (!parsed.mentor) return null;
    return mentors.find((m) => m.slug === parsed.mentor) ?? null;
  } catch {
    return null;
  }
}
