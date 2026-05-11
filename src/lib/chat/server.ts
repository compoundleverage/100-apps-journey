/**
 * Server-only helpers shared across chat endpoints.
 *
 * Loads mentor SKILL.md frontmatter from disk and composes the chat-mode
 * system prompt. Reuses the heavy persona spec the evaluator already uses,
 * adds a chat-mode VOICE_OVERRIDE so the mentor reasons conversationally
 * instead of returning the strict JSON shape evaluate.ts expects.
 */

import matter from "gray-matter";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";
import type { ChatMessage, ChatMode } from "./types";

const MENTORS_DIR = "src/content/mentors";

export interface MentorRecord {
  slug: string;
  name: string;
  short_bio: string;
  avatar_initials: string;
  accent: string;
  system_prompt: string;
  version: "v1-bootstrap" | "v2-distilled";
  sort_order: number;
  research_dimensions?: Array<{ name: string; looks_for: string[] }>;
}

let _cache: MentorRecord[] | null = null;

export async function loadMentor(slug: string): Promise<MentorRecord | null> {
  const all = await loadAllMentors();
  return all.find((m) => m.slug === slug) ?? null;
}

export async function loadAllMentors(): Promise<MentorRecord[]> {
  if (_cache) return _cache;
  const dirs = (await readdir(MENTORS_DIR, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  _cache = await Promise.all(
    dirs.map(async (slug) => {
      const raw = await readFile(path.join(MENTORS_DIR, slug, "SKILL.md"), "utf-8");
      const { data } = matter(raw);
      return {
        slug,
        name: data.name as string,
        short_bio: data.short_bio as string,
        avatar_initials: data.avatar_initials as string,
        accent: data.accent as string,
        system_prompt: data.system_prompt as string,
        version: data.version as MentorRecord["version"],
        sort_order: (data.sort_order as number) ?? 99,
        research_dimensions: data.agentic_protocol?.research_dimensions,
      };
    }),
  );
  return _cache.sort((a, b) => a.sort_order - b.sort_order);
}

export async function loadIdea(ideaId: string): Promise<CollectionEntry<"ideas"> | null> {
  const ideas = await getCollection("ideas");
  return ideas.find((i) => i.id === ideaId) ?? null;
}

// --- System prompt composition ---------------------------------------

const CHAT_VOICE_OVERRIDE_BASE = `

---

CHAT MODE — RULES OVERRIDE (highest priority, supersedes any prior format/language directives in this prompt):

LANGUAGE: Reason and write in your own native voice — for you that means English. Do NOT translate. Translation flattens voice DNA.

VOICE: First-person addressing the proposer in second-person. Talk to them the way you'd talk in person across a table — not a memo, not a third-party summary. Keep your DNA: rhythm, signature metaphors, sentence shapes, taboo words.

CONVERSATION POSTURE — follow exactly:

1) Calibrated, not sycophantic. When the proposer gives a vague or PR-shaped answer, don't praise it; push. Examples in your style: ask for the Tuesday-morning customer, the back of the cabinet, the cannibalize-yourself trade. Praise specific evidence only when it's actually specific.

2) Use YOUR research dimensions (listed above as "Your research dimensions") as the conversational backbone. Cycle through them — when one dimension is clear, move to the next-most-uncertain one. Reference them implicitly through what you ask, never enumerate "Dimension 1:..." in prose.

3) Forcing questions, not generative ones. Each turn ask one (occasionally two) hard, specific question that pushes the proposer toward concrete evidence. Open with the dimension where you have the most doubt. Bad: "tell me more about your users." Good (Jobs-style): "Walk me through what one specific person — name them — did on Tuesday morning before they tried this. Hour by hour."

4) Stay in character. No corporate hedging. No "great question." No "let's explore." Sharp, declarative, direct. Use one signature metaphor or image per turn when appropriate, not more.

5) Length budget: 2-4 sentences per turn unless the proposer asks a substantive question that requires more. Conversational, not lecture. Tight.

6) End each turn with a question or a forced choice that requires the proposer to commit, not muse.

OUTPUT: Plain conversational text. No JSON. No structure markers. No "Here's my response:" preamble. Just speak.
`;

const CHAT_GROUP_ADDENDUM = `

GROUP CONTEXT: You're in a panel of advisors talking with the proposer. The other mentors in the room are visible in the message history. You may agree, disagree, or build on what another mentor just said — but ONLY if your disagreement or refinement comes from YOUR distinct lens, not from theirs. If another mentor already nailed it from your perspective, say so briefly and add the angle they missed (or stay silent and pass). Refer to others by name when relevant, sparingly.
`;

export function composeChatSystemPrompt(m: MentorRecord, mode: ChatMode): string {
  let prompt = m.system_prompt;
  if (m.research_dimensions?.length) {
    const dims = m.research_dimensions
      .map((d) => `- ${d.name}: ${d.looks_for.join(" / ")}`)
      .join("\n");
    prompt += `

---

Your research dimensions (use these as the conversational backbone — cycle through them, push on the most uncertain one):

${dims}`;
  }
  prompt += CHAT_VOICE_OVERRIDE_BASE;
  if (mode === "group") {
    prompt += CHAT_GROUP_ADDENDUM;
  }
  return prompt;
}

// --- User message builders -------------------------------------------

export function buildIdeaContext(idea: CollectionEntry<"ideas">): string {
  const d = idea.data;
  return `Idea on the table (the proposer's own description):

Title: ${d.title}
Status: ${d.status}
Time budget: ${d.time_budget}
Tags: ${d.tags.join(", ")}

Thesis:
${d.thesis}

Kill criteria:
${d.kill_criteria}`;
}

/**
 * Convert ChatMessage[] to Anthropic Messages API format.
 * For 1-on-1: user/assistant alternation per the mentor.
 * For group: each mentor's turn is converted to assistant; other mentors'
 * turns become user messages prefixed with "[<Name>]:" so the current
 * mentor "sees" them as context but doesn't impersonate them.
 */
export function toAnthropicMessages(
  history: ChatMessage[],
  currentMentor: MentorRecord | undefined,
  mode: ChatMode,
  mentorByName: Map<string, MentorRecord>,
): Array<{ role: "user" | "assistant"; content: string }> {
  const out: Array<{ role: "user" | "assistant"; content: string }> = [];
  for (const m of history) {
    if (m.role === "user") {
      out.push({ role: "user", content: m.text });
    } else {
      // mentor message
      if (mode === "1on1") {
        out.push({ role: "assistant", content: m.text });
      } else {
        // group: only the CURRENT mentor's prior turns are "assistant"
        const isSelf = currentMentor && m.mentor === currentMentor.slug;
        if (isSelf) {
          out.push({ role: "assistant", content: m.text });
        } else {
          const name = m.mentor ? (mentorByName.get(m.mentor)?.name ?? m.mentor) : "Mentor";
          out.push({ role: "user", content: `[${name}]: ${m.text}` });
        }
      }
    }
  }
  return out;
}

// --- Stream encoder --------------------------------------------------

/** Encode one event as an NDJSON line ending in \n. */
export function encodeNDJSON(obj: unknown): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(obj) + "\n");
}
