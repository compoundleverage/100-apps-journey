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
  try {
    return await handle(params, request);
  } catch (e: unknown) {
    const msg = e instanceof Error ? `${e.message}\n${e.stack ?? ""}` : String(e);
    console.error("[chat/group] uncaught:", msg);
    return new Response(`server error: ${msg}`.slice(0, 1000), { status: 500 });
  }
};

async function handle(
  params: Record<string, string | undefined>,
  request: Request,
): Promise<Response> {
  const ideaId = params.idea;
  if (!ideaId) return new Response("Missing idea", { status: 400 });

  const apiKey = request.headers.get("x-user-anthropic-key")?.trim();
  if (!apiKey || !apiKey.startsWith("sk-ant-")) {
    return new Response("Missing or malformed X-User-Anthropic-Key header", { status: 401 });
  }

  let body: { history?: ChatMessage[]; mentors?: string[] };
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

  // Visitor-side seated filter: if the client passes a non-empty mentors[]
  // array, restrict the panel to that intersection. Empty / missing falls
  // back to the full catalog so we never return zero participants.
  let panel = allMentors;
  if (Array.isArray(body.mentors) && body.mentors.length > 0) {
    const requested = new Set(body.mentors);
    const filtered = allMentors.filter((m) => requested.has(m.slug));
    if (filtered.length > 0) {
      panel = filtered;
    } else {
      console.warn(
        `[chat/group] no seated mentors matched catalog (requested: ${body.mentors.join(",")}), falling back to full catalog`,
      );
    }
  }

  const mentorByName = new Map(panel.map((m) => [m.slug, m]));
  const ideaCtx = buildIdeaContext(idea);
  const client = new Anthropic({ apiKey });

  const hasMentorTurns = history.some((m) => m.role === "mentor");

  if (!hasMentorTurns) {
    // OPENING PASS — every seated mentor weighs in. Stream them serially so
    // the ordering is deterministic and the client sees one mentor finish
    // before the next begins. Each gets `speaker` event + own delta stream.
    return openingPassResponse(client, panel, ideaCtx, history, mentorByName);
  }

  // FOLLOW-UP: orchestrator picks who speaks next from the seated panel.
  return followupTurnResponse(client, panel, ideaCtx, history, mentorByName);
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
        // Accumulate panel turns serially so each mentor SEES the prior
        // panelists' takes via toAnthropicMessages (other mentors' messages
        // get prefixed with "[Name]:" and routed as user-role context).
        // This is what makes the round-table a discussion instead of N
        // parallel evaluations.
        const runningHistory: ChatMessage[] = [...history];

        for (let i = 0; i < mentors.length; i++) {
          const mentor = mentors[i];
          const isOpener = i === 0;

          // Flush buffer hint
          controller.enqueue(encodeNDJSON({ type: "delta", text: "" }));

          const sysPrompt = composeChatSystemPrompt(mentor, "group");
          const msgs = toAnthropicMessages(runningHistory, mentor, "group", mentorByName);

          const priorNames = runningHistory
            .filter((m) => m.role === "mentor" && m.mentor)
            .map((m) => mentorByName.get(m.mentor!)?.name)
            .filter(Boolean) as string[];

          const userTurn = isOpener
            ? `${ideaCtx}\n\n---\n\n${userIntro ? `The proposer just framed it: "${userIntro}"\n\n` : ""}You are OPENING a live panel discussion — not a parallel evaluation, not a written memo. The other panelists will respond AFTER you, and they'll be watching what you say.\n\nIn 2–3 sentences, your authentic voice:\n• Stake out the angle where you have the MOST doubt about this idea.\n• Frame it as a sharp, specific question to the proposer — not a generic "what's the user need" but the one question you'd ask in person.\n\nSet the tone. This is Shark Tank, not a focus group.`
            : `${ideaCtx}\n\n---\n\nLive panel discussion in progress. Prior speakers in order: ${priorNames.join(", ")}. Their turns are above (prefixed with [Name]:).\n\nYou speak NEXT. Two to four sentences in your authentic voice. You MUST:\n• Reference at least one prior panelist BY NAME — agree with their angle and extend it from your lens, push back on what they're missing, or escalate the challenge. Do NOT recite or echo them.\n• Add YOUR distinct angle (the one only you see — not a duplicate of what's been said).\n• End by throwing a sharp question — either to the proposer OR back to one of the panelists by name.\n\nThis is a real-time discussion. DO NOT recite a static evaluation. Engage. Disagree. Build. Challenge.`;

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
          // Speaker attribution — closes this mentor's turn on the client.
          controller.enqueue(encodeNDJSON({ type: "done", speaker: mentor.slug }));

          // Feed this turn into runningHistory so the NEXT mentor sees it.
          if (buffer.trim()) {
            runningHistory.push({
              role: "mentor",
              mentor: mentor.slug,
              text: buffer,
              ts: new Date().toISOString(),
            });
          }
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

  // Names of OTHER panelists who've spoken (so the prompt can encourage
  // engagement-by-name rather than monologue).
  const otherSpeakerNames = Array.from(
    new Set(
      history
        .filter((m) => m.role === "mentor" && m.mentor && m.mentor !== chosen!.slug)
        .map((m) => mentorByName.get(m.mentor!)?.name)
        .filter(Boolean) as string[],
    ),
  );
  const refClause =
    otherSpeakerNames.length > 0
      ? `Other panelists in the room: ${otherSpeakerNames.join(", ")}. Reference at least ONE of them by name — agree-and-extend, push back, or throw a question back to them.`
      : `You're the first mentor to follow the proposer's reply — set the tone.`;

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
              content: `It's your turn in the live panel discussion. ${refClause}\n\nTwo to four sentences in your authentic voice. Build on, push back, or correct — but ONLY from YOUR distinct lens. Do NOT recite a static evaluation. End with a sharp question for the proposer OR a challenge thrown back to a panelist by name. No corporate hedging.`,
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
