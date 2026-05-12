#!/usr/bin/env bun
/**
 * Cross-collection content validator. Runs before `astro build` to catch
 * referential drift between ideas and mentors that Zod can't see (Zod runs
 * per-collection without cross-collection awareness).
 *
 * Checks:
 *   1. Every `investor_evaluations[].persona` slug in any idea must exist as
 *      a mentor under src/content/mentors/<slug>/.
 *   2. Every evaluation's `mentor_version` should match the mentor's current
 *      `version`. Mismatch = warning (suggest re-running evaluate).
 *   3. Every mentor must have a non-empty `system_prompt` in frontmatter.
 *   4. Every slug in DEFAULT_SEATED_SLUGS (src/lib/seated.ts) must exist as a
 *      mentor. Missing → warning (visitors silently drop unknown slugs, but
 *      builder should update the constant).
 *
 * Exit 1 on any ERROR; warnings print but don't fail the build.
 */

import matter from "gray-matter";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { DEFAULT_SEATED_SLUGS } from "../src/lib/seated";

const IDEAS_DIR = "src/content/ideas";
const MENTORS_DIR = "src/content/mentors";

type Mentor = {
  slug: string;
  version: "v1-bootstrap" | "v2-distilled" | string;
  system_prompt: string;
};

type Evaluation = {
  persona?: string;
  mentor_version?: string;
};

type Idea = {
  file: string;
  id: number;
  evaluations: Evaluation[];
};

async function loadMentors(): Promise<Mentor[]> {
  const dirs = (await readdir(MENTORS_DIR, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  return Promise.all(
    dirs.map(async (slug) => {
      const raw = await readFile(join(MENTORS_DIR, slug, "SKILL.md"), "utf-8");
      const { data } = matter(raw);
      return {
        slug,
        version: (data.version as string) ?? "unknown",
        system_prompt: (data.system_prompt as string) ?? "",
      };
    }),
  );
}

async function loadIdeas(): Promise<Idea[]> {
  const files = (await readdir(IDEAS_DIR)).filter((f) => f.endsWith(".md"));
  return Promise.all(
    files.map(async (file) => {
      const raw = await readFile(join(IDEAS_DIR, file), "utf-8");
      const { data } = matter(raw);
      return {
        file,
        id: data.id as number,
        evaluations: (data.investor_evaluations as Evaluation[]) ?? [],
      };
    }),
  );
}

function bold(s: string) {
  return `\x1b[1m${s}\x1b[0m`;
}
function red(s: string) {
  return `\x1b[31m${s}\x1b[0m`;
}
function yellow(s: string) {
  return `\x1b[33m${s}\x1b[0m`;
}
function green(s: string) {
  return `\x1b[32m${s}\x1b[0m`;
}

async function main() {
  const [mentors, ideas] = await Promise.all([loadMentors(), loadIdeas()]);
  const mentorMap = new Map(mentors.map((m) => [m.slug, m]));

  const errors: string[] = [];
  const warnings: string[] = [];

  // Check 3: every mentor has system_prompt
  for (const m of mentors) {
    if (!m.system_prompt || m.system_prompt.trim().length < 50) {
      errors.push(
        `mentor "${m.slug}" has missing or trivial system_prompt frontmatter (length ${m.system_prompt.length})`,
      );
    }
  }

  // Check 4: default seated mentors must exist in catalog
  for (const slug of DEFAULT_SEATED_SLUGS) {
    if (!mentorMap.has(slug)) {
      warnings.push(
        `DEFAULT_SEATED_SLUGS in src/lib/seated.ts references "${slug}" — no such mentor in ${MENTORS_DIR}/. Visitors will silently drop it; edit the constant to fix.`,
      );
    }
  }

  // Checks 1+2: cross-reference ideas → mentors
  for (const idea of ideas) {
    for (const ev of idea.evaluations) {
      if (!ev.persona) {
        errors.push(`${idea.file}: evaluation missing 'persona' field`);
        continue;
      }
      const mentor = mentorMap.get(ev.persona);
      if (!mentor) {
        errors.push(
          `${idea.file}: evaluation.persona="${ev.persona}" — no such mentor in ${MENTORS_DIR}/`,
        );
        continue;
      }
      if (ev.mentor_version && ev.mentor_version !== mentor.version) {
        warnings.push(
          `${idea.file}: evaluation.persona="${ev.persona}" was scored against ${ev.mentor_version} but mentor is now ${mentor.version} — re-run \`bun run evaluate ${idea.file.replace(/\.md$/, "")}\``,
        );
      }
    }
  }

  console.log(bold("validate-content"));
  console.log(
    `  loaded ${mentors.length} mentors, ${ideas.length} ideas (${ideas.reduce((n, i) => n + i.evaluations.length, 0)} evaluations)`,
  );

  if (warnings.length > 0) {
    console.log(yellow(`  ${warnings.length} warning(s):`));
    for (const w of warnings) console.log(`    ${yellow("⚠")}  ${w}`);
  }
  if (errors.length > 0) {
    console.log(red(`  ${errors.length} error(s):`));
    for (const e of errors) console.log(`    ${red("✗")}  ${e}`);
    process.exit(1);
  }
  console.log(green("  ✓ all cross-collection references valid"));
}

main().catch((err) => {
  console.error(red("validate-content failed:"));
  console.error(err);
  process.exit(2);
});
