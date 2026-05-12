import type { APIRoute } from "astro";
import Anthropic from "@anthropic-ai/sdk";
import { loadIdea, loadMentor } from "../../../../lib/chat/server";
import type { ChatMessage } from "../../../../lib/chat/types";

export const prerender = false;

const MODEL = "claude-sonnet-4-6";

/**
 * "Re-score after a conversation" endpoint.
 *
 * The proposer just had a chat with this mentor (any number of turns).
 * Take that transcript and ask the mentor to update their score using
 * the same dimension-first workflow as evaluate.ts.
 *
 * POST body shape:
 *   {
 *     ideaId: string,
 *     history: ChatMessage[],          // the chat transcript
 *     original?: { score, reasoning }  // anchor for the re-score
 *   }
 *
 * Returns:
 *   { score: 1-10, reasoning: string, dimensions?: [...], refined_at: ISO }
 *
 * Uses the user's API key in `X-User-Anthropic-Key`.
 */

interface RescoreRequest {
  ideaId: string;
  history: ChatMessage[];
  original?: { score: number; reasoning: string };
}

export const POST: APIRoute = async ({ params, request }) => {
  try {
    return await handle(params, request);
  } catch (e: unknown) {
    const msg = e instanceof Error ? `${e.message}\n${e.stack ?? ""}` : String(e);
    console.error("[chat/clarify] uncaught:", msg);
    return new Response(`server error: ${msg}`.slice(0, 1000), { status: 500 });
  }
};

async function handle(
  params: Record<string, string | undefined>,
  request: Request,
): Promise<Response> {
  const mentorSlug = params.mentor;
  if (!mentorSlug) return new Response("Missing mentor", { status: 400 });

  const apiKey = request.headers.get("x-user-anthropic-key")?.trim();
  if (!apiKey || !apiKey.startsWith("sk-ant-")) {
    return new Response("Missing or malformed X-User-Anthropic-Key header", { status: 401 });
  }

  let body: RescoreRequest;
  try {
    body = (await request.json()) as RescoreRequest;
  } catch {
    return new Response("Body must be JSON", { status: 400 });
  }
  if (!body.ideaId) return new Response("Missing ideaId", { status: 400 });
  const history = Array.isArray(body.history) ? body.history : [];
  if (history.length === 0) {
    return new Response(
      "Cannot re-score with no conversation — chat at least one turn first",
      { status: 400 },
    );
  }

  const [mentor, idea] = await Promise.all([loadMentor(mentorSlug), loadIdea(body.ideaId)]);
  if (!mentor) return new Response(`No mentor "${mentorSlug}"`, { status: 404 });
  if (!idea) return new Response(`No idea "${body.ideaId}"`, { status: 404 });

  const client = new Anthropic({ apiKey });
  const d = idea.data;
  const ideaCtx = `Title: ${d.title}\nStatus: ${d.status}\nThesis: ${d.thesis}\nKill criteria: ${d.kill_criteria}`;

  // Format chat history into a readable transcript for the rescore prompt.
  const transcript = history
    .map((m) => {
      if (m.role === "user") return `Proposer: ${m.text}`;
      return `${mentor.name}: ${m.text}`;
    })
    .join("\n\n");

  const dimList = mentor.research_dimensions
    ?.map((d) => `- ${d.name}: ${d.looks_for.join(" / ")}`)
    .join("\n");

  const rescoreSystem = `${mentor.system_prompt}

---

${dimList ? `Your research dimensions:\n${dimList}\n\n---\n\n` : ""}RESCORE WORKFLOW (highest priority — overrides prior format):

Native voice. English. First-person to proposer in second-person.

You previously evaluated this idea. The proposer just held a conversation with you (transcript below) — use what they actually said (or failed to say) to update your view. Re-score using the SAME calibrated workflow:

Step 1 — For each of YOUR research dimensions, commit a verdict ("pass" | "fail" | "unclear") + 1 short note (≤ 12 words). Update verdicts based on the new evidence the proposer provided in conversation.

Step 2 — Aggregate to a 1-10 score using THIS calibrated scale (do not invent your own):
  1-2 Reject. 3-4 Skeptical. 5-6 Plausible. 7-8 Worth backing. 9-10 Conviction.

Step 3 — Reasoning: 2-3 sentences in your voice. Reference what the conversation actually surfaced — names, numbers, commitments — and what is still missing. Don't praise vague answers; if the proposer talked a lot but said nothing concrete, that's a downward signal, not an upward one.

OUTPUT (strict JSON, nothing else, no preamble):
{
  "dimensions": [{"name": "...", "verdict": "pass|fail|unclear", "note": "..."}, ...],
  "score": <1-10>,
  "reasoning": "<2-3 sentences in your native voice, second-person to proposer>"
}`;

  const userMsg = `${ideaCtx}\n\n---\n\nConversation transcript (most recent first to last):\n\n${transcript}${
    body.original
      ? `\n\n---\n\nYour original score before this conversation: ${body.original.score}/10\nYour original reasoning: ${body.original.reasoning}`
      : ""
  }`;

  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 800,
    system: rescoreSystem,
    messages: [{ role: "user", content: userMsg }],
  });
  const text = (res.content.find((c) => c.type === "text") as { text?: string } | undefined)?.text ?? "{}";
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  let parsed: { score?: number; reasoning?: string; dimensions?: unknown };
  try {
    parsed = JSON.parse(text.slice(start, end + 1));
  } catch {
    return new Response(`Mentor returned malformed rescore: ${text.slice(0, 200)}`, {
      status: 502,
    });
  }
  const score = Math.max(1, Math.min(10, Math.round(Number(parsed.score) || 0)));
  const reasoning = String(parsed.reasoning ?? "").trim();
  if (!reasoning) {
    return new Response("Mentor returned no reasoning", { status: 502 });
  }
  let dimensions:
    | Array<{ name: string; verdict: "pass" | "fail" | "unclear"; note: string }>
    | undefined;
  if (Array.isArray(parsed.dimensions)) {
    dimensions = parsed.dimensions
      .map((d: unknown) => {
        if (!d || typeof d !== "object") return null;
        const o = d as Record<string, unknown>;
        const v = String(o.verdict ?? "unclear").toLowerCase();
        return {
          name: String(o.name ?? "").trim(),
          verdict: (v === "pass" || v === "fail" ? v : "unclear") as
            | "pass"
            | "fail"
            | "unclear",
          note: String(o.note ?? "").trim(),
        };
      })
      .filter(
        (d): d is { name: string; verdict: "pass" | "fail" | "unclear"; note: string } =>
          d !== null && Boolean(d.name),
      );
  }
  return new Response(
    JSON.stringify({ score, reasoning, dimensions, refined_at: new Date().toISOString() }),
    { headers: { "Content-Type": "application/json" } },
  );
}
