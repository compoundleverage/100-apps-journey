#!/usr/bin/env bun
/**
 * Delete a mentor with cascade cleanup of idea evaluations.
 *
 * Removes `src/content/mentors/<slug>/` AND scrubs any
 * `investor_evaluations[].persona === <slug>` entries from
 * `src/content/ideas/*.md` so that `bun run validate-content` stays clean.
 *
 * Safe-by-default: prompts for confirmation, writes idea files BEFORE
 * removing the mentor dir (so a mid-flight crash leaves a re-runnable state).
 *
 * Usage:  bun run mentor:delete <slug>
 */

import {
  existsSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

const MENTORS_DIR = "src/content/mentors";
const IDEAS_DIR = "src/content/ideas";

function bold(s: string) { return `\x1b[1m${s}\x1b[0m`; }
function dim(s: string) { return `\x1b[2m${s}\x1b[0m`; }
function green(s: string) { return `\x1b[32m${s}\x1b[0m`; }
function red(s: string) { return `\x1b[31m${s}\x1b[0m`; }
function yellow(s: string) { return `\x1b[33m${s}\x1b[0m`; }

type Evaluation = { persona?: string; [k: string]: unknown };

interface AffectedIdea {
  file: string;
  path: string;
  removed: number;
  data: Record<string, unknown>;
  body: string;
}

function scanIdeas(slug: string): AffectedIdea[] {
  const files = readdirSync(IDEAS_DIR).filter((f) => f.endsWith(".md"));
  const affected: AffectedIdea[] = [];
  for (const file of files) {
    const path = join(IDEAS_DIR, file);
    const raw = readFileSync(path, "utf-8");
    const parsed = matter(raw);
    const evals = (parsed.data.investor_evaluations as Evaluation[] | undefined) ?? [];
    const kept = evals.filter((e) => e.persona !== slug);
    const removed = evals.length - kept.length;
    if (removed > 0) {
      affected.push({
        file,
        path,
        removed,
        data: { ...parsed.data, investor_evaluations: kept },
        body: parsed.content,
      });
    }
  }
  return affected;
}

function main() {
  const args = process.argv.slice(2);
  const slug = args[0];
  if (!slug) {
    console.log(red("\n  Usage: bun run mentor:delete <slug>\n"));
    process.exit(1);
  }

  const mentorDir = join(MENTORS_DIR, slug);
  if (!existsSync(mentorDir)) {
    console.log(red(`\n  No mentor at ${mentorDir}.`));
    console.log(dim(`  Available: ${readdirSync(MENTORS_DIR).join(", ")}\n`));
    process.exit(1);
  }

  console.log(bold(`\n  Delete mentor: ${slug}`));
  console.log(dim(`  Path: ${mentorDir}\n`));

  const affected = scanIdeas(slug);
  const totalRemoved = affected.reduce((n, a) => n + a.removed, 0);
  if (affected.length === 0) {
    console.log(dim("  No idea evaluations reference this mentor — clean delete.\n"));
  } else {
    console.log(`  ${yellow("⚠")}  Will also remove ${bold(String(totalRemoved))} evaluation(s) from ${bold(String(affected.length))} idea file(s):`);
    for (const a of affected) {
      console.log(`      ${dim("·")} ${a.file} (-${a.removed})`);
    }
    console.log();
  }

  const ans = prompt(`  Proceed? (y/N): `);
  if (ans === null || !/^y(es)?$/i.test(ans.trim())) {
    console.log(yellow("\n  Aborted — nothing changed.\n"));
    process.exit(0);
  }

  // Stage 1: rewrite idea files first (so a crash here leaves mentor intact, re-runnable)
  for (const a of affected) {
    const next = matter.stringify(a.body, a.data);
    writeFileSync(a.path, next, "utf-8");
    console.log(`  ${green("✓")} cleaned ${a.file}`);
  }

  // Stage 2: remove mentor directory
  rmSync(mentorDir, { recursive: true, force: true });
  console.log(`  ${green("✓")} removed ${mentorDir}`);

  console.log();
  console.log(green(`  ✓ Done. Deleted mentor "${slug}".`));
  if (totalRemoved > 0) {
    console.log(dim(`    Run \`bun run validate-content\` to confirm, or \`bun run dev\` to preview.\n`));
  } else {
    console.log();
  }
}

main();
