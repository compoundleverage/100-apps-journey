# 100 Apps Journey

A public ledger of small app experiments — 100 attempts in 100 days, each evaluated by an AI panel of investors. Built in public.

## Stack

- **Astro 5** with **`output: "server"`** + `@astrojs/vercel` adapter — pages are SSR
  so `?lang=en` query strings can swap UI chrome at request time. OG endpoints
  opt back into static via `export const prerender = true`.
- **Tailwind v4** via Vite plugin
- **Bun** runtime + package manager
- **Node 22+** required for Astro tooling (`nvm use 22`)
- **TypeScript strict**
- `@anthropic-ai/sdk` for panel evaluations (Claude Sonnet 4.6 default)
- `satori` + `@resvg/resvg-js` for build-time OG image rendering
- **Production**: <https://100-apps-journey.vercel.app/>

## Common commands

```bash
nvm use 22                         # required before any astro/bun command
bun install                        # first-time / dependency change
bun run dev                        # http://localhost:4321
bun run build                      # static output to dist/
bun run preview                    # preview prod build (gates dev-only routes like /preview)

bun run evaluate <idea-slug>       # run AI panel on one idea
bun run evaluate --all             # run on every idea
bun run evaluate --all --model=claude-haiku-4-5-20251001  # cheaper

bun run validate-content           # cross-collection schema check (mentors ↔ ideas); chained into build
bun run validate-sources           # source-reliability rubric check on mentor citations (on demand)

bun run mentor:add                 # interactive v1-bootstrap mentor scaffolder (custom/fictional)
bun run mentor:delete <slug>       # delete a mentor + cascade-clean idea evaluations
```

OG images for `/`, every idea, and every mentor are generated at build time
under `dist/og/...` via `src/lib/og/` (satori → SVG, resvg → PNG). The site
default lives at `/og.png`; per-page OG paths are wired in each layout.

## i18n

UI chrome lives in `src/lib/i18n.ts` as a `STRINGS` lookup keyed by `zh | en`.
`getLang(Astro.url)` reads `?lang=en` from the URL (default `zh`); pages are
SSR so the same route renders both languages from one HTML file. Internal
links go through `localizedHref(path, lang)` so the language preference
follows navigation. An inline script in `Layout.astro` writes the chosen
preference to `localStorage` and redirects URL-less visits when one is stored.

Mentor reasoning is **always rendered in the mentor's native language**
(English for the current bench) — this is enforced by `VOICE_OVERRIDE` in
`scripts/evaluate.ts`. Translating mentor voice flattens the DNA, so the EN
UI shows English reasoning and the CN UI also shows English reasoning, just
inside a Chinese chrome.

Idea body markdown stays in its source language (Chinese for #001) regardless
of UI lang — long-form translation is out of scope.

## Scoring workflow (evaluate.ts)

Each mentor evaluation is a structured 3-step workflow enforced by
`VOICE_OVERRIDE`:

1. Per `agentic_protocol.research_dimensions`, commit a verdict
   (`pass | fail | unclear`) + ≤12-word note.
2. Aggregate to a 1–10 score using a calibrated scale anchor (1-2 reject;
   3-4 skeptical; 5-6 plausible; 7-8 worth backing; 9-10 conviction). The
   scale is shared across mentors so scores are comparable.
3. 2-3-sentence reasoning in the mentor's native voice, second-person to the
   proposer, referencing the verdict pattern implicitly.

The output JSON is `{dimensions: [{name, verdict, note}, ...], score, reasoning}`.
The `dimensions[]` array persists into the idea's `investor_evaluations[]`
frontmatter for transparency.

## Content shape

- **Ideas**: `src/content/ideas/NNN-slug.md`. Schema in `src/content/config.ts`. Frontmatter: `id`, `title`, `status` (idea/building/shipped/killed), dates, `thesis`, `kill_criteria`, `time_budget`, `disclosure`, `tags`, `investor_evaluations[]`. Body is the long-form retrospective.
- **Mentors**: `src/content/mentors/<slug>/SKILL.md`. Frontmatter holds the **system_prompt** (NOT the body — body leaks to public site, prompt would too). Plus structured: `mental_models[]`, `decision_heuristics[]`, `expression_dna{}`, `tells[]`, `values[]`, `anti_patterns[]`, `tensions[]`, `boundaries[]`, `version` ("v1-bootstrap" | "v2-distilled"), `agentic_protocol{}` (v2 only). Body is short prose framing for the public detail page.
- **Mentor research files**: `src/content/mentors/<slug>/references/research/01-06.md` — the 6-agent audit trail when the mentor was forged. Not parsed by Astro; not rendered. Just history.

## Progressive disclosure

Idea content has 4 disclosure levels: `auto` (default, status-driven) | `full` | `thesis` | `title`. Logic in `src/lib/disclosure.ts`:

- `bun run dev` (`import.meta.env.DEV` true) — always shows full content (you are the author).
- Production build (`import.meta.env.DEV` false) — applies status-driven gating: `idea` → title only, `building` → + thesis + kill criteria, `shipped`/`killed` → full.
- Manual override via `disclosure:` field in frontmatter wins over auto.

Build new idea entries with `status: idea` and the world only sees the title + tags until you flip to `building` or `shipped`.

## The skill: /persona-forge

`.claude/skills/persona-forge/SKILL.md` is a Claude Code slash command that distills a named individual into a complete mentor SKILL.md via 6-agent parallel research → triple-validated extraction → 3-stage quality gate → atomic promotion. Methodology adapted from [nuwa-skill](https://github.com/alchaincyf/nuwa-skill).

Adaptations from nuwa-skill:
- Source filtering by **content quality**, not platform/language. See `.claude/skills/persona-forge/references/source-reliability.md` for the 4-dimension rubric (Primacy / Verifiability / Authority / Corroboration).
- Output goes to `src/content/mentors/<slug>/`, integrating directly into the Astro content collection.
- WIP staging at `.persona-forge/wip/<slug>/` (gitignored). Atomic mv only after Phase 4 quality gate passes.
- `--resume <slug>` and `--abort <slug>` commands for crash recovery.

To upgrade an existing v1-bootstrap mentor or forge a new one:
```
/persona-forge "<full name>"
```
~$1-2 in API charges, 8-15 minutes execution + ~30 min of attention if you review checkpoints honestly.

## Mentor catalog operations

The catalog (`src/content/mentors/`) is managed entirely by the builder via CLI / Claude Code Skills. Three entry points, picked by operation type:

| Need | Claude Code | Any agent / shell |
|---|---|---|
| Full distillation of a real public figure | `/persona-forge "<name>"` | — (LLM-heavy; CC-only) |
| Quick scaffold of a custom / fictional persona (v1-bootstrap stub) | `/mentor-add` | `bun run mentor:add` |
| Delete a mentor + cascade-clean idea evaluations | `/mentor-delete <slug>` | `bun run mentor:delete <slug>` |

**Principle: core UI behaviors all have CLI equivalents.** Anything an authenticated builder can do through the UI (today: nothing — the UI is visitor-facing) MUST also be reachable via a bun script, so Codex / Cursor / plain shell can manage the catalog. The `/mentor-*` Skills are *thin wrappers* around the bun scripts: same logic, different ergonomics.

Why this matters: Skills are **Claude Code-specific** — Codex et al. don't read `.claude/skills/*.md` and can't invoke CC's `Agent`/`Task` tools. CLI scripts are the universal fallback. `/persona-forge` is the one exception (its 6-agent distillation needs CC's parallel-agent dispatch and can't be ported to a bun script without a complete rewrite).

The delete script writes idea files FIRST then removes the mentor dir — a mid-flight crash leaves a re-runnable state (mentor still present, partial cascade safely re-applied).

## Visitor bench (seated mentors)

Web visitors pick ≤4 mentors to "seat" on their personal bench. Selection lives in `localStorage` under key `seated:v1` (JSON array of slugs) and **filters** what they see — it does NOT mutate the catalog.

Architecture:

- **Source of truth**: `src/lib/seated.ts`. Exports `DEFAULT_SEATED_SLUGS` (builder's curated 4), `MAX_SEATS` (= 4), and SSR-safe helpers (`getSeatedSlugs`, `setSeatedSlugs`, `toggleSeat`, `filterSeated`, `resetSeats`). Dispatches `window` event `seated:changed` on writes so multi-component pages re-render in sync.
- **First-visit experience**: builder hard-codes 4 default slugs in `DEFAULT_SEATED_SLUGS`. `validate-content.ts` Check 4 warns (yellow, non-blocking) if any of those slugs is missing from the catalog.
- **Server still loads everything**: API and SSR always load the full catalog. Filtering happens in two places:
  1. **Client**: `InvestorPanel.astro` script hides non-seated cards on hydrate; `/mentors` page splits cards into "Your bench" (seated) and "Available" (rest) and provides a `+ Seat` / `✕ Unseat` toggle on each.
  2. **Server**: `/api/chat/group/<idea>` accepts an optional `mentors?: string[]` POST field; when present and non-empty, only those mentors participate in the round-table. Empty/missing falls back to the full catalog (defensive — never zero participants).
- **Deleting a seated mentor**: `seated.ts`'s `filterSeated` silently drops unknown slugs; visitors get a smaller bench without errors. If a default-seated slug gets deleted, `bun run validate-content` flags it as a warning — builder should edit `DEFAULT_SEATED_SLUGS`.

The cap (4) is intentional: more than ~4 mentors in a round-table dilutes each turn and inflates per-message latency. To change the cap, edit `MAX_SEATS` in one place.

## Batch parallelism rule (operational)

**Independent operations should run in parallel by default.** When a batch task has no causal dependencies between items (e.g., multiple `/persona-forge` runs on different mentors), do NOT serialize them. Three patterns:

1. **Subagent fan-out**: one orchestrator subagent per item, all dispatched in a single message. Each orchestrator handles its item end-to-end and writes to a slug-isolated path (e.g., `.persona-forge/wip/<slug>/`). Use this for items that themselves spawn subagents — the outer orchestrator absorbs the subagent depth so the parent agent doesn't have to manage 30+ direct children.

2. **Direct fan-out**: when each item is a single tool call, dispatch all in one message. Use for batched bash, batched reads, batched edits where targets don't conflict.

3. **Worktree fan-out**: only when items modify shared mutable state (the same file, the same git branch). Create isolated git worktrees and run agents in each. Reserve for the rare case — slug/path isolation is usually enough.

For batch checkpoint approval: the existing `/persona-forge` skill assumes interactive checkpoints (Phase 0A / 1.5 / 2.5). When running a batch, **auto-approve the checkpoints** with the same defaults the user would have picked (full panorama / web-only / proceed) and surface anomalies in the final summary — don't ask 18 times for "A) proceed."

## Skill routing

When a user request matches an available skill, invoke it via the Skill tool.

- Product ideas / brainstorming → `/office-hours`
- Strategy / scope review → `/plan-ceo-review`
- Architecture review → `/plan-eng-review`
- Design review → `/plan-design-review` or `/design-consultation`
- Full review pipeline → `/autoplan`
- Bugs / errors → `/investigate`
- QA / testing → `/qa` or `/qa-only`
- Code review → `/review`
- Visual polish → `/design-review`
- Frontend builds → `/frontend-design`
- Ship / deploy / PR → `/ship` or `/land-and-deploy`
- Save progress → `/context-save`
- Resume → `/context-restore`
- Forge a new mentor for the panel (real public figure) → `/persona-forge "<name>"`
- Scaffold a custom / fictional mentor → `/mentor-add` (or `bun run mentor:add`)
- Delete a mentor + clean idea evaluations → `/mentor-delete <slug>` (or `bun run mentor:delete <slug>`)

## Disclaimer

Every panel evaluation is an **AI-generated simulation** based on each individual's public writings and talks. The site footer (`Layout.astro`) and `/about` carry a permanent disclaimer; per-card "AI Sim" chrome was retired in commit `512de63` in favor of the macro disclaimer (i18n + first-person mentor voice work). None of these are actual statements or endorsements from the people simulated.
