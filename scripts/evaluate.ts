#!/usr/bin/env bun
/**
 * Investor panel evaluator with Agentic Protocol.
 *
 * Each mentor's full system prompt (their distilled persona) drives evaluation.
 * v2-distilled mentors with `agentic_protocol.research_dimensions` get those
 * dimensions injected as internal-checklist guidance before scoring.
 *
 * The mentor system prompt is sent as an `ephemeral` cache breakpoint, so
 * running this against multiple ideas in sequence reuses the cache (~50%
 * cost savings on large input).
 *
 * Usage:
 *   bun run evaluate <slug>        evaluate one idea by filename or slug
 *   bun run evaluate --all         evaluate every idea
 *   bun run evaluate --model=...   override model (default claude-sonnet-4-6)
 *
 * Required env: ANTHROPIC_API_KEY
 */

import Anthropic from "@anthropic-ai/sdk";
import matter from "gray-matter";
import { readFile, writeFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const DEFAULT_MODEL = "claude-sonnet-4-6";
const IDEAS_DIR = "src/content/ideas";
const MENTORS_DIR = "src/content/mentors";

// ANSI color codes for progress lines (no external dep).
const C = {
  dim: "\x1b[2m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

interface ResearchDimension {
  name: string;
  looks_for: string[];
}

interface AgenticProtocol {
  research_dimensions: ResearchDimension[];
}

interface MentorMember {
  slug: string;
  name: string;
  short_bio: string;
  avatar_initials: string;
  accent: string;
  system_prompt: string;
  version: "v1-bootstrap" | "v2-distilled";
  sort_order: number;
  agentic_protocol?: AgenticProtocol;
}

/**
 * Build the final system prompt sent to the API.
 * For v2-distilled mentors with agentic_protocol, append the research dimensions
 * as an internal-only checklist. Output format remains JSON {score, reasoning}.
 */
function composeSystemPrompt(m: MentorMember): string {
  if (!m.agentic_protocol?.research_dimensions?.length) {
    return m.system_prompt;
  }
  const dimensions = m.agentic_protocol.research_dimensions
    .map((d) => `- ${d.name}: ${d.looks_for.join(" / ")}`)
    .join("\n");

  return `${m.system_prompt}

---

Internal checklist before scoring (do NOT output this; reason silently against each dimension, then produce the JSON):

${dimensions}

For each dimension, ask: does the idea pass, fail, or sit unclear? Use that internal pass/fail/unclear pattern to calibrate the score. Do not enumerate dimensions in your output — produce the JSON with score + reasoning only.`;
}

async function loadPanel(): Promise<MentorMember[]> {
  const dirents = await readdir(MENTORS_DIR, { withFileTypes: true });
  const slugs = dirents
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const panel = await Promise.all(
    slugs.map(async (slug) => {
      const content = await readFile(
        join(MENTORS_DIR, slug, "SKILL.md"),
        "utf-8",
      );
      const { data } = matter(content);
      return {
        slug,
        name: data.name as string,
        short_bio: data.short_bio as string,
        avatar_initials: data.avatar_initials as string,
        accent: data.accent as string,
        system_prompt: data.system_prompt as string,
        version: data.version as "v1-bootstrap" | "v2-distilled",
        sort_order: (data.sort_order as number) ?? 99,
        agentic_protocol: data.agentic_protocol as AgenticProtocol | undefined,
      };
    }),
  );

  return panel.sort((a, b) => a.sort_order - b.sort_order);
}

interface Evaluation {
  persona: string;
  mentor_version: "v1-bootstrap" | "v2-distilled";
  score: number;
  reasoning: string;
  generated_at: string;
  model: string;
  /** Internal — not persisted to frontmatter. */
  _usage?: {
    input: number;
    output: number;
    cacheRead: number;
    cacheCreate: number;
  };
}

interface IdeaFile {
  filepath: string;
  filename: string;
  data: Record<string, unknown>;
  body: string;
}

async function loadIdeas(filter?: string): Promise<IdeaFile[]> {
  const files = (await readdir(IDEAS_DIR))
    .filter((f) => f.endsWith(".md"))
    .sort();

  const targets = filter
    ? files.filter((f) => {
        const slug = f.replace(/\.md$/, "");
        return f === filter || slug === filter || slug.startsWith(filter);
      })
    : files;

  if (targets.length === 0 && filter) {
    console.error(`No idea matching "${filter}" in ${IDEAS_DIR}`);
    return [];
  }

  return Promise.all(
    targets.map(async (filename) => {
      const filepath = join(IDEAS_DIR, filename);
      const raw = await readFile(filepath, "utf-8");
      const parsed = matter(raw);
      return {
        filepath,
        filename,
        data: parsed.data as Record<string, unknown>,
        body: parsed.content,
      };
    })
  );
}

function buildUserMessage(idea: IdeaFile): string {
  const d = idea.data;
  return `Title: ${d.title}
Status: ${d.status}
Time budget: ${d.time_budget}
Tags: ${Array.isArray(d.tags) ? (d.tags as string[]).join(", ") : ""}

Thesis:
${d.thesis}

Kill criteria:
${d.kill_criteria}

Body:
${idea.body.trim()}`;
}

function extractJson(text: string): { score: number; reasoning: string } {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error(`No JSON object found in: ${text.slice(0, 200)}`);
  }
  const jsonStr = text.slice(start, end + 1);
  let parsed: { score?: unknown; reasoning?: unknown };
  try {
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    throw new Error(`Failed to parse JSON: ${jsonStr.slice(0, 200)}`);
  }
  const score = Number(parsed.score);
  const reasoning = String(parsed.reasoning ?? "").trim();
  if (!Number.isFinite(score) || !reasoning) {
    throw new Error(`Missing score/reasoning in: ${jsonStr.slice(0, 200)}`);
  }
  return { score, reasoning };
}

async function evaluateOne(
  client: Anthropic,
  persona: MentorMember,
  userMessage: string,
  model: string
): Promise<Evaluation> {
  const response = await client.messages.create({
    model,
    max_tokens: 800,
    // System prompt is the lion's share of input tokens (mentor SKILL ~600-1000 words).
    // Cache it as an ephemeral breakpoint — reuses across calls in the same eval run
    // and across eval runs within ~5 minutes.
    system: [
      {
        type: "text",
        text: composeSystemPrompt(persona),
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: userMessage,
            cache_control: { type: "ephemeral" },
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text") as
    | { type: "text"; text: string }
    | undefined;
  if (!textBlock) throw new Error("Response had no text content");

  const { score, reasoning } = extractJson(textBlock.text);
  const clamped = Math.max(1, Math.min(10, Math.round(score)));

  const u = response.usage as {
    input_tokens?: number;
    output_tokens?: number;
    cache_read_input_tokens?: number;
    cache_creation_input_tokens?: number;
  };

  return {
    persona: persona.slug,
    mentor_version: persona.version,
    score: clamped,
    reasoning,
    generated_at: new Date().toISOString(),
    model,
    _usage: {
      input: u?.input_tokens ?? 0,
      output: u?.output_tokens ?? 0,
      cacheRead: u?.cache_read_input_tokens ?? 0,
      cacheCreate: u?.cache_creation_input_tokens ?? 0,
    },
  };
}

async function evaluateIdea(
  client: Anthropic,
  idea: IdeaFile,
  model: string,
  panel: MentorMember[],
): Promise<void> {
  const idStr = String(idea.data.id ?? "?").padStart(3, "0");
  console.log(
    `\n${C.bold}▶ №${idStr}${C.reset}  ${C.dim}·${C.reset}  "${idea.data.title}"`,
  );
  console.log(
    `  ${C.dim}Dispatching ${panel.length} mentors in parallel${C.reset}` +
      `  ${C.dim}·${C.reset}  ${C.cyan}${model}${C.reset}`,
  );
  const startedAt = Date.now();
  const userMessage = buildUserMessage(idea);

  const settled = await Promise.allSettled(
    panel.map((persona) => evaluateOne(client, persona, userMessage, model)),
  );

  const evaluations: Evaluation[] = [];
  let cacheReadInputTokens = 0;
  let cacheCreationInputTokens = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  settled.forEach((result, i) => {
    const persona = panel[i];
    const versionGlyph = persona.version === "v2-distilled" ? "●" : "◌";
    const initials = persona.avatar_initials.padEnd(3);
    const name = persona.name.padEnd(20);
    if (result.status === "fulfilled") {
      const ev = result.value;
      evaluations.push(ev);
      const score = ev.score;
      const color =
        score >= 8 ? C.green : score >= 5 ? C.yellow : C.red;
      console.log(
        `  ${C.dim}${versionGlyph}${C.reset} ${initials} ${name} ` +
          `${color}${String(score).padStart(2)}${C.reset} ${C.dim}/ 10${C.reset}`,
      );
      if (ev._usage) {
        cacheReadInputTokens += ev._usage.cacheRead;
        cacheCreationInputTokens += ev._usage.cacheCreate;
        totalInputTokens += ev._usage.input;
        totalOutputTokens += ev._usage.output;
      }
    } else {
      console.error(
        `  ${C.dim}${versionGlyph}${C.reset} ${initials} ${name} ` +
          `${C.red}✕${C.reset}  ${C.dim}${result.reason}${C.reset}`,
      );
    }
  });

  if (evaluations.length === 0) {
    console.error(`  ${C.red}!${C.reset} No evaluations succeeded — skipping write.`);
    return;
  }

  // Strip the internal _usage field before persisting.
  const cleanedEvaluations = evaluations.map(({ _usage, ...rest }) => rest);
  const newData = { ...idea.data, investor_evaluations: cleanedEvaluations };
  const newContent = matter.stringify(idea.body, newData);
  await writeFile(idea.filepath, newContent, "utf-8");

  const avg =
    cleanedEvaluations.reduce((s, e) => s + e.score, 0) /
    cleanedEvaluations.length;
  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);

  const cacheHitPct =
    cacheReadInputTokens + cacheCreationInputTokens > 0
      ? Math.round(
          (cacheReadInputTokens /
            (cacheReadInputTokens + cacheCreationInputTokens + totalInputTokens)) *
            100,
        )
      : 0;

  console.log(
    `  ${C.green}✓${C.reset} Wrote ${cleanedEvaluations.length}/${panel.length} evaluations  ` +
      `${C.dim}·${C.reset}  avg ${C.bold}${avg.toFixed(1)}${C.reset}  ` +
      `${C.dim}·${C.reset}  ${elapsed}s  ` +
      `${C.dim}·${C.reset}  ${C.dim}cache ${cacheHitPct}% (${cacheReadInputTokens} read, ${cacheCreationInputTokens} create) · ${totalOutputTokens} out${C.reset}`,
  );
}

async function main() {
  const args = process.argv.slice(2);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error(
      "ANTHROPIC_API_KEY not set. Add it to .env or export it in shell."
    );
    process.exit(1);
  }

  const modelArg = args.find((a) => a.startsWith("--model="));
  const model = modelArg ? modelArg.slice("--model=".length) : DEFAULT_MODEL;

  const all = args.includes("--all");
  const target = args.find((a) => !a.startsWith("--"));

  if (!all && !target) {
    console.error(
      "Usage: bun run evaluate <slug> | --all  [--model=claude-sonnet-4-6]"
    );
    process.exit(1);
  }

  const ideas = await loadIdeas(target);
  if (ideas.length === 0) process.exit(1);

  const panel = await loadPanel();
  if (panel.length === 0) {
    console.error("No mentors found in src/content/mentors/. Add at least one before evaluating.");
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });

  console.log(
    `Evaluating ${ideas.length} idea(s) with ${panel.length} mentors  ·  model: ${model}`
  );

  for (const idea of ideas) {
    await evaluateIdea(client, idea, model, panel);
  }

  console.log("\n✓ Done.");
}

main().catch((e) => {
  console.error("\nFatal:", e);
  process.exit(1);
});
