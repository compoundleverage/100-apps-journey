#!/usr/bin/env bun
/**
 * Source-reliability rubric enforcement.
 *
 * The persona-forge skill writes citations inline in two places:
 *   - SKILL.md frontmatter: `mental_models[].evidence[]` strings
 *   - references/research/0X-*.md files
 *
 * Each citation is tagged `[P=N V=N A=N C=N total=N]` per the 4-dimension
 * rubric in .claude/skills/persona-forge/references/source-reliability.md
 * (Primacy / Verifiability / Authority / Corroboration).
 *
 * Per-mentor floor (enforced for v2-distilled only; v1-bootstrap reports only):
 *   - count(citations where total >= 10) >= 2 × num_mental_models
 *     ("心智模型必须 ≥ 2 条 ≥10 分一手来源支撑")
 *   - % primacy=3 of all cited sources >= 50%
 *     ("> 50% 一手来源")
 *
 * Output: per-mentor table + summary; exit 1 if any v2-distilled mentor
 * misses the floor.
 */

import matter from "gray-matter";
import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";

const MENTORS_DIR = "src/content/mentors";
const CITE_RE = /\[P=([0-3]) V=([0-3]) A=([0-3]) C=([0-3]) total=(\d+)\]/g;

type Cite = {
  P: number;
  V: number;
  A: number;
  C: number;
  total: number;
  origin: "skill" | "research";
};

type Report = {
  slug: string;
  version: string;
  mental_models: number;
  cites: Cite[];
  ge10: number;
  primary: number;
  verdict: "pass" | "warn" | "fail";
  reasons: string[];
};

function red(s: string) {
  return `\x1b[31m${s}\x1b[0m`;
}
function yellow(s: string) {
  return `\x1b[33m${s}\x1b[0m`;
}
function green(s: string) {
  return `\x1b[32m${s}\x1b[0m`;
}
function dim(s: string) {
  return `\x1b[2m${s}\x1b[0m`;
}
function bold(s: string) {
  return `\x1b[1m${s}\x1b[0m`;
}

function extractCites(text: string, origin: "skill" | "research"): Cite[] {
  const out: Cite[] = [];
  let m: RegExpExecArray | null;
  CITE_RE.lastIndex = 0;
  while ((m = CITE_RE.exec(text)) !== null) {
    out.push({
      P: parseInt(m[1], 10),
      V: parseInt(m[2], 10),
      A: parseInt(m[3], 10),
      C: parseInt(m[4], 10),
      total: parseInt(m[5], 10),
      origin,
    });
  }
  return out;
}

async function loadMentor(slug: string): Promise<Report> {
  const dir = join(MENTORS_DIR, slug);
  const skill = await readFile(join(dir, "SKILL.md"), "utf-8");
  const { data } = matter(skill);

  const version = (data.version as string) ?? "unknown";
  const mental_models = Array.isArray(data.mental_models)
    ? data.mental_models.length
    : 0;

  const cites: Cite[] = extractCites(skill, "skill");

  // Optional research/ dir
  try {
    const researchDir = join(dir, "references", "research");
    const files = (await readdir(researchDir)).filter((f) => f.endsWith(".md"));
    for (const f of files) {
      const raw = await readFile(join(researchDir, f), "utf-8");
      cites.push(...extractCites(raw, "research"));
    }
  } catch {
    // no research dir — fine
  }

  const ge10 = cites.filter((c) => c.total >= 10).length;
  const primary = cites.filter((c) => c.P === 3).length;

  const reasons: string[] = [];
  let verdict: "pass" | "warn" | "fail" = "pass";

  if (version === "v2-distilled") {
    const requiredHighScore = mental_models * 2;
    if (ge10 < requiredHighScore) {
      verdict = "fail";
      reasons.push(
        `cites ≥10 (${ge10}) < 2 × mental_models (${requiredHighScore})`,
      );
    }
    const primaryPct = cites.length === 0 ? 0 : primary / cites.length;
    if (primaryPct < 0.5) {
      if (verdict !== "fail") verdict = "warn";
      reasons.push(
        `primary (P=3) ${(primaryPct * 100).toFixed(0)}% < 50%`,
      );
    }
  } else {
    // v1-bootstrap or unknown: report only
    if (cites.length === 0) {
      verdict = "warn";
      reasons.push("no citation tags found (bootstrap)");
    }
  }

  return {
    slug,
    version,
    mental_models,
    cites,
    ge10,
    primary,
    verdict,
    reasons,
  };
}

async function main() {
  const dirs = (await readdir(MENTORS_DIR, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const reports = await Promise.all(dirs.map(loadMentor));
  reports.sort((a, b) => a.slug.localeCompare(b.slug));

  console.log(bold("validate-sources"));
  console.log(
    dim(
      `  rubric: .claude/skills/persona-forge/references/source-reliability.md`,
    ),
  );
  console.log("");

  const header = `  ${"mentor".padEnd(15)}  ${"version".padEnd(13)}  ${"models".padStart(6)}  ${"cites".padStart(5)}  ${"≥10".padStart(4)}  ${"prim%".padStart(5)}  verdict`;
  console.log(dim(header));
  console.log(dim("  " + "─".repeat(header.length - 2)));

  let failures = 0;
  let warns = 0;

  for (const r of reports) {
    const primPct =
      r.cites.length === 0 ? 0 : Math.round((r.primary / r.cites.length) * 100);
    const verdictMark =
      r.verdict === "pass"
        ? green("✓")
        : r.verdict === "warn"
          ? yellow("⚠")
          : red("✗");
    const line = `  ${r.slug.padEnd(15)}  ${r.version.padEnd(13)}  ${String(r.mental_models).padStart(6)}  ${String(r.cites.length).padStart(5)}  ${String(r.ge10).padStart(4)}  ${(primPct + "%").padStart(5)}  ${verdictMark}`;
    console.log(line);
    for (const reason of r.reasons) {
      console.log(`    ${dim("›")} ${dim(reason)}`);
    }
    if (r.verdict === "fail") failures++;
    if (r.verdict === "warn") warns++;
  }

  console.log("");
  if (failures > 0) {
    console.log(
      red(`✗ ${failures} mentor(s) below source-reliability floor`),
    );
    process.exit(1);
  }
  if (warns > 0) {
    console.log(yellow(`⚠ ${warns} mentor(s) with warnings (not fatal)`));
  } else {
    console.log(green("✓ all mentors meet source-reliability floor"));
  }
}

main().catch((err) => {
  console.error(red("validate-sources failed:"));
  console.error(err);
  process.exit(2);
});
