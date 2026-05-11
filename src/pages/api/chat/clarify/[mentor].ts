import type { APIRoute } from "astro";
import Anthropic from "@anthropic-ai/sdk";
import { loadIdea, loadMentor } from "../../../../lib/chat/server";

export const prerender = false;

const MODEL = "claude-sonnet-4-6";
const MAX_QUESTIONS = 3;

/**
 * Clarify flow: two phases, two endpoints sharing this file via `phase`.
 *
 * POST body shape:
 *   { phase: "questions", ideaId } → returns { questions: string[] }
 *   { phase: "rescore", ideaId, answers: [{ q, a }] } → returns refined evaluation
 *
 * Both phases use the user's API key in `X-User-Anthropic-Key`.
 */

interface QuestionsRequest {
  phase: "questions";
  ideaId: string;
}

interface RescoreRequest {
  phase: "rescore";
  ideaId: string;
  questions: string[];
  answers: string[];
  /** Optional: original evaluation, used as anchor for re-scoring. */
  original?: { score: number; reasoning: string };
}

type ClarifyRequest = QuestionsRequest | RescoreRequest;

export const POST: APIRoute = async ({ params, request }) => {
  const mentorSlug = params.mentor;
  if (!mentorSlug) return new Response("Missing mentor", { status: 400 });

  const apiKey = request.headers.get("x-user-anthropic-key")?.trim();
  if (!apiKey || !apiKey.startsWith("sk-ant-")) {
    return new Response("Missing or malformed X-User-Anthropic-Key header", { status: 401 });
  }

  let body: ClarifyRequest;
  try {
    body = (await request.json()) as ClarifyRequest;
  } catch {
    return new Response("Body must be JSON", { status: 400 });
  }

  const [mentor, idea] = await Promise.all([loadMentor(mentorSlug), loadIdea(body.ideaId)]);
  if (!mentor) return new Response(`No mentor "${mentorSlug}"`, { status: 404 });
  if (!idea) return new Response(`No idea "${body.ideaId}"`, { status: 404 });

  const client = new Anthropic({ apiKey });
  const d = idea.data;
  const ideaCtx = `Title: ${d.title}\nStatus: ${d.status}\nThesis: ${d.thesis}\nKill criteria: ${d.kill_criteria}`;

  if (body.phase === "questions") {
    // Ask the mentor to produce 1-3 sharp forcing questions in their voice.
    const questionGenSystem = `${mentor.system_prompt}

---

CLARIFY QUESTION GENERATION (highest priority — overrides any prior format spec):

Native voice. English. First-person, direct.

Generate ${MAX_QUESTIONS} sharp forcing questions to ask the proposer about this idea, before re-scoring it. Each question should:
- Push at the dimension where YOU have the most doubt (cycle through your research_dimensions)
- Be concrete and answerable (no "tell me more about your users" — instead "name one user, what they did Tuesday morning")
- Stay in YOUR voice (signature metaphors, sentence shape, lexicon)
- Be 1-2 sentences max each

Return ONLY a strict JSON array of strings, no preamble:
["question 1", "question 2", "question 3"]`;

    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 500,
      system: questionGenSystem,
      messages: [{ role: "user", content: ideaCtx }],
    });
    const text = (res.content.find((c) => c.type === "text") as { text?: string } | undefined)?.text ?? "[]";
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");
    let questions: string[] = [];
    try {
      questions = JSON.parse(text.slice(start, end + 1));
    } catch {
      return new Response(`Mentor returned malformed questions: ${text.slice(0, 200)}`, { status: 502 });
    }
    return new Response(JSON.stringify({ questions: questions.slice(0, MAX_QUESTIONS) }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (body.phase === "rescore") {
    // Re-score with the dimension-first workflow used by evaluate.ts.
    const dialogue = body.questions
      .map((q, i) => `Q: ${q}\nA: ${body.answers[i] ?? "(no answer)"}`)
      .join("\n\n");
    const dimList = mentor.research_dimensions
      ?.map((d) => `- ${d.name}: ${d.looks_for.join(" / ")}`)
      .join("\n");
    const rescoreSystem = `${mentor.system_prompt}

---

${dimList ? `Your research dimensions:\n${dimList}\n\n---\n\n` : ""}RESCORE WORKFLOW (highest priority — overrides prior format):

Native voice. English. First-person to proposer in second-person.

You previously evaluated this idea. The proposer just answered ${body.questions.length} of YOUR clarifying questions. Re-score using the SAME calibrated workflow:

Step 1 — For each of YOUR research dimensions, commit a verdict ("pass" | "fail" | "unclear") + 1 short note (≤ 12 words). Update verdicts based on the new evidence the proposer provided.

Step 2 — Aggregate to a 1-10 score using THIS calibrated scale (do not invent your own):
  1-2 Reject. 3-4 Skeptical. 5-6 Plausible. 7-8 Worth backing. 9-10 Conviction.

Step 3 — Reasoning: 2-3 sentences in your voice. Explicitly reference what the proposer's answers added or failed to add — but don't praise vague answers.

OUTPUT (strict JSON, nothing else):
{
  "dimensions": [{"name": "...", "verdict": "pass|fail|unclear", "note": "..."}, ...],
  "score": <1-10>,
  "reasoning": "<2-3 sentences in your native voice, second-person to proposer>"
}`;

    const userMsg = `${ideaCtx}\n\n---\n\nYour prior questions and the proposer's answers:\n\n${dialogue}${
      body.original ? `\n\n---\n\nYour original score: ${body.original.score}/10\nYour original reasoning: ${body.original.reasoning}` : ""
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
      return new Response(`Mentor returned malformed rescore: ${text.slice(0, 200)}`, { status: 502 });
    }
    const score = Math.max(1, Math.min(10, Math.round(Number(parsed.score) || 0)));
    const reasoning = String(parsed.reasoning ?? "").trim();
    if (!reasoning) {
      return new Response("Mentor returned no reasoning", { status: 502 });
    }
    let dimensions: Array<{ name: string; verdict: "pass" | "fail" | "unclear"; note: string }> | undefined;
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
        .filter((d): d is { name: string; verdict: "pass" | "fail" | "unclear"; note: string } => d !== null && Boolean(d.name));
    }
    return new Response(
      JSON.stringify({ score, reasoning, dimensions, refined_at: new Date().toISOString() }),
      { headers: { "Content-Type": "application/json" } },
    );
  }

  return new Response(`Unknown phase: ${(body as { phase?: string }).phase}`, { status: 400 });
};
