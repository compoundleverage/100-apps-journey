#!/usr/bin/env bun
/**
 * Interactive v1-bootstrap mentor scaffolder.
 *
 * For real public figures who deserve full distillation, use `/persona-forge`
 * in Claude Code instead. This script is for: custom personas, fictional
 * characters, collaborators not in public sources, or a quick stub you'll
 * later upgrade via `/persona-forge --update <slug>`.
 *
 * Output: src/content/mentors/<slug>/SKILL.md with minimal-valid frontmatter
 * satisfying src/content/config.ts schema. Body is a short prose note.
 *
 * Usage:  bun run mentor:add
 */

import { existsSync, readdirSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

const MENTORS_DIR = "src/content/mentors";

const ACCENT_PALETTE = ["#10b981", "#f59e0b", "#3b82f6", "#ec4899", "#8b5cf6", "#ef4444"];

// --- helpers ---------------------------------------------------------

function bold(s: string) { return `\x1b[1m${s}\x1b[0m`; }
function dim(s: string) { return `\x1b[2m${s}\x1b[0m`; }
function green(s: string) { return `\x1b[32m${s}\x1b[0m`; }
function red(s: string) { return `\x1b[31m${s}\x1b[0m`; }
function yellow(s: string) { return `\x1b[33m${s}\x1b[0m`; }

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function validateInitials(s: string): boolean {
  return [...s].length === 2;
}

export function validateAccent(s: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(s);
}

export function deriveInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase().padEnd(2, "?");
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function ask(question: string, fallback?: string): string {
  const hint = fallback ? dim(` [${fallback}]`) : "";
  const ans = prompt(`${question}${hint}`);
  if (ans === null) {
    console.log(red("\nAborted."));
    process.exit(1);
  }
  const trimmed = ans.trim();
  return trimmed === "" && fallback !== undefined ? fallback : trimmed;
}

function askMultiline(question: string, fallback: string): string {
  console.log(question + dim(" (end with empty line; press Enter twice for default)"));
  const lines: string[] = [];
  while (true) {
    const ln = prompt("> ");
    if (ln === null) {
      console.log(red("\nAborted."));
      process.exit(1);
    }
    if (ln === "") {
      if (lines.length === 0) return fallback;
      break;
    }
    lines.push(ln);
  }
  return lines.join("\n");
}

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function maxSortOrder(): number {
  if (!existsSync(MENTORS_DIR)) return 0;
  let max = 0;
  for (const dir of readdirSync(MENTORS_DIR, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    const file = join(MENTORS_DIR, dir.name, "SKILL.md");
    if (!existsSync(file)) continue;
    try {
      const { data } = matter(readFileSync(file, "utf-8"));
      const n = typeof data.sort_order === "number" ? data.sort_order : 0;
      if (n > max) max = n;
    } catch { /* skip */ }
  }
  return max;
}

// --- main ------------------------------------------------------------

function buildFrontmatter(input: {
  name: string;
  slug: string;
  short_bio: string;
  avatar_initials: string;
  accent: string;
  epitaph: string;
  system_prompt: string;
}): string {
  const today = new Date().toISOString().slice(0, 10);
  const next = maxSortOrder() + 10;
  const data = {
    name: input.name,
    short_bio: input.short_bio,
    avatar_initials: input.avatar_initials,
    accent: input.accent,
    sort_order: next,
    research_date: today,
    version: "v1-bootstrap",
    epitaph: input.epitaph,
    system_prompt: input.system_prompt,
    mental_models: [
      {
        name: "TODO",
        summary: "TODO — describe one mental model this mentor uses (≥10 chars).",
        evidence: [],
      },
    ],
    decision_heuristics: [
      { rule: "TODO — heuristic rule", when: "TODO — when this rule fires" },
    ],
    expression_dna: {
      sentence_style: "TODO",
      vocabulary: "TODO",
      rhythm: "TODO",
      humor: "TODO",
      certainty: "TODO",
      citation_habits: "TODO",
    },
    tells: [],
    values: [],
    anti_patterns: [],
    tensions: [],
    boundaries: [
      "v1-bootstrap stub — promote to v2-distilled via /persona-forge --update <slug>.",
    ],
    primary_sources: [],
    secondary_sources: [],
  };
  const body = `\n## About ${input.name}\n\nThis is a **v1-bootstrap** mentor — a quick scaffold. To upgrade with full 6-agent distillation (mental models, decision heuristics, expression DNA, sourced evidence), run \`/persona-forge --update ${input.slug}\` in Claude Code.\n`;
  return matter.stringify(body, data);
}

async function main() {
  console.log(bold("\n  Quick-scaffold a v1-bootstrap mentor\n"));
  console.log(
    dim(
      "  For real public figures, use /persona-forge in Claude Code (6-agent\n" +
      "  distillation, ~$1-2). This scaffolder is for custom/fictional personas.\n",
    ),
  );

  const name = ask(bold("  Full name:"));
  if (!name) { console.log(red("Name is required.")); process.exit(1); }

  const suggestedSlug = slugify(name);
  let slug = ask(`  Slug (folder name):`, suggestedSlug);
  if (!/^[a-z0-9-]+$/.test(slug)) {
    console.log(red(`  Invalid slug "${slug}" — must be lowercase letters, numbers, hyphens.`));
    process.exit(1);
  }
  const targetDir = join(MENTORS_DIR, slug);
  if (existsSync(targetDir)) {
    console.log(red(`  ${targetDir} already exists. Delete first or pick a different slug.`));
    process.exit(1);
  }

  const short_bio = ask("  Short bio (≤120 chars):", `${name} · TODO`);
  if (short_bio.length > 120) {
    console.log(yellow(`  Note: bio is ${short_bio.length} chars; cards may truncate.`));
  }

  const initialsDefault = deriveInitials(name);
  let avatar_initials = ask("  Avatar initials (exactly 2 chars):", initialsDefault);
  if (!validateInitials(avatar_initials)) {
    console.log(red(`  Avatar initials must be exactly 2 characters. Got "${avatar_initials}".`));
    process.exit(1);
  }

  const accentDefault = pickRandom(ACCENT_PALETTE);
  const accent = ask("  Accent color (hex):", accentDefault);
  if (!validateAccent(accent)) {
    console.log(red(`  Invalid hex color "${accent}". Format: #rrggbb.`));
    process.exit(1);
  }

  const epitaph = ask("  Epitaph (one memorable line):", `One line that captures ${name}.`);

  const promptFallback = `You are channeling ${name} evaluating an app idea. Reason and write as they authentically would. (v1-bootstrap stub — replace with a real prompt of at least 150 characters, or upgrade via /persona-forge --update ${slug}.)`;
  const system_prompt = askMultiline("  System prompt (≥150 chars):", promptFallback);
  if (system_prompt.length < 150) {
    console.log(red(`  System prompt must be ≥150 chars (got ${system_prompt.length}).`));
    process.exit(1);
  }

  // Summary
  console.log("\n" + bold("  Summary:"));
  console.log(`    name:            ${name}`);
  console.log(`    slug:            ${slug}`);
  console.log(`    short_bio:       ${short_bio}`);
  console.log(`    avatar_initials: ${avatar_initials}`);
  console.log(`    accent:          ${accent}`);
  console.log(`    epitaph:         ${epitaph}`);
  console.log(`    system_prompt:   ${system_prompt.slice(0, 80)}${system_prompt.length > 80 ? "…" : ""}`);
  console.log(`    target:          ${join(targetDir, "SKILL.md")}\n`);

  const confirm = ask("  Write this file? (y/N):", "n");
  if (!/^y(es)?$/i.test(confirm)) {
    console.log(yellow("  Aborted — no files written."));
    process.exit(0);
  }

  mkdirSync(targetDir, { recursive: true });
  const fm = buildFrontmatter({ name, slug, short_bio, avatar_initials, accent, epitaph, system_prompt });
  writeFileSync(join(targetDir, "SKILL.md"), fm, "utf-8");

  console.log(green(`\n  ✓ Wrote ${join(targetDir, "SKILL.md")}`));
  console.log("\n  Next steps:");
  console.log(`    1. ${bold("bun run dev")} → visit /mentors/${slug} to see the stub`);
  console.log(`    2. Hand-edit the SKILL.md to fill in real fields, OR`);
  console.log(`    3. In Claude Code: ${bold(`/persona-forge --update ${slug}`)} to upgrade to v2-distilled`);
  console.log(`    4. To seat as default: edit DEFAULT_SEATED_SLUGS in src/lib/seated.ts\n`);
}

main();
