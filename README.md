# 100 Apps Journey

A public ledger of small app experiments — 100 attempts in 100 days, each
evaluated by an AI panel of investors with strong personalities and stronger
opinions. Visitors can also chat with the panel directly.

Live: <https://100-apps-journey.vercel.app/>

The differentiator isn't the tracker — it's that the panel is a real
working interaction surface. Every entry is scored by a roster of mentors
distilled from public writings via the project's `/persona-forge` skill.
They don't divide labor by topic — each one reasons in their full voice,
and the disagreement is the signal.

> The current bench, version distribution, and chat-mode availability are
> shown live on the homepage's first idea entry — `LiveStateNote.astro`
> reads directly from `getCollection("mentors")` so this README stays
> evergreen and the site stays in sync without manual edits.

## Stack

- **Astro 5** SSR via `@astrojs/vercel` adapter — pages render per request
  so `?lang=en` query strings can swap UI chrome at request time. OG
  endpoints opt back into static via `export const prerender = true`.
- **Tailwind v4** via Vite plugin
- **Bun** runtime + package manager
- **Node 22+** required for Astro tooling
- **TypeScript strict**
- **`@anthropic-ai/sdk`** for panel evaluations + chat (Claude Sonnet 4.6
  default; cheap Haiku for the group orchestrator's "pick next speaker" call)
- **`satori` + `@resvg/resvg-js`** for build-time OG image rendering

## Local development

```bash
nvm use 22
bun install
bun run dev      # http://localhost:4321
bun run build    # SSR build → .vercel/output/
bun run preview  # NOT supported by the Vercel adapter; use dev for local testing

bun run validate-content   # cross-collection schema check (chained into build)
bun run validate-sources   # source-reliability rubric check on mentor citations
```

## Adding an idea

Create `src/content/ideas/NNN-slug.md`:

```yaml
---
id: 2
title: "Your idea title"
status: idea           # idea | building | shipped | killed
date_added: 2026-05-08
thesis: "Why this might be valuable, in one or two sentences."
kill_criteria: "When to retire this without sentiment."
time_budget: "1d"
tags: [productivity, ai-native]
investor_evaluations: []
---

# Body markdown — design notes, retrospective, lessons learned.
```

Frontmatter is type-checked at build time via `src/content/config.ts`.

## Generating panel evaluations (author-side)

After writing the markdown, fill the panel automatically:

```bash
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env
bun run evaluate 002-your-slug
bun run evaluate --all
bun run evaluate --all --model=claude-haiku-4-5-20251001  # cheaper
```

Each invocation runs a structured 3-step workflow per mentor:

1. Per `agentic_protocol.research_dimensions`, commit a verdict
   (`pass | fail | unclear`) + ≤12-word note.
2. Aggregate to a 1-10 score using a calibrated, mentor-shared scale anchor
   (1-2 reject / 3-4 skeptical / 5-6 plausible / 7-8 worth backing /
   9-10 conviction). The scale is shared across mentors so scores compare.
3. 2-3 sentence reasoning in the mentor's NATIVE voice — second-person to
   the proposer, no JSON, no hedging.

Output JSON `{dimensions: [...], score, reasoning}` writes back to the idea
frontmatter. The `dimensions[]` array is persisted for transparency.

## Chat features (visitor-side, BYOK)

Three interaction modes, all powered by **the visitor's own Anthropic API
key** entered on `/settings`. The site never pays for chat usage; the key
lives in the visitor's localStorage only and is forwarded over HTTPS per
request without server-side logging.

- **Clarify** — per-card "Clarify →" button on each evaluation. The mentor
  generates 1-3 forcing questions in their voice, you answer, they re-score
  using the same dimension-first workflow as the offline evaluator. The
  refined card stacks under the original.
- **1-on-1** — "Talk to [Mentor] →" opens a right-side drawer. Free-form
  chat in the mentor's voice, using their research dimensions as the
  conversational backbone. Cap 20 turns per session.
- **Group panel** — "Open panel discussion →" on the idea page. Opening pass
  fans out all mentors (each with a 4-sentence opening + one forcing
  question), then an orchestrator picks "whose distinct lens diverges most"
  for each follow-up. Use `@<name>` to call on a specific mentor.

State is in localStorage keyed by `chat:<mode>:<idea>:<mentor>`. Refined
evaluations persist as `refined:<idea>:<mentor>`.

## i18n

UI chrome lives in `src/lib/i18n.ts` as a `STRINGS` lookup keyed by
`zh | en`. Default is Chinese; `?lang=en` flips. Mentor reasoning is
**always rendered in the mentor's native language** (English for the
current bench) — translating mentor voice flattens the DNA. Idea body
markdown stays in its source language.

## Project shape

```
src/
├── content/
│   ├── config.ts             # Zod schema, evaluations + refined evaluations
│   ├── ideas/*.md            # one entry per app attempt
│   └── mentors/<slug>/SKILL.md  # forged personas (frontmatter is the source of truth)
├── lib/
│   ├── chat/                 # types, storage, server, drawer, clarify, client
│   ├── i18n.ts               # STRINGS table + getLang/localizedHref
│   ├── og/                   # satori + resvg image generation
│   ├── disclosure.ts         # progressive disclosure helper
│   └── scoring.ts
├── components/
│   ├── ChatDrawer.astro      # global drawer — mounted once in Layout
│   ├── GroupChatTrigger.astro
│   ├── LiveStateNote.astro   # auto-rendered "current state" callout
│   ├── InvestorPanel.astro
│   ├── IdeaCard.astro
│   ├── StatusBadge.astro
│   └── LoadingPanel.astro
├── layouts/Layout.astro      # masthead, lang toggle, footer disclaimer, drawer mount
├── pages/
│   ├── index.astro           # the pipeline
│   ├── settings.astro        # BYOK API key entry
│   ├── ideas/[slug].astro    # single entry (SSR — fetches by Astro.params.slug)
│   ├── mentors/{index,[slug]}.astro
│   ├── stats.astro
│   ├── about.astro
│   ├── og.png.ts             # static OG (home)
│   ├── og/{ideas,mentors}/[slug].png.ts  # static OG per entry
│   └── api/chat/             # SSR chat endpoints (test-key, 1on1, clarify, group)
└── styles/global.css         # Tailwind v4 @theme + prose-journal
scripts/
├── evaluate.ts               # offline panel evaluator (author-side)
├── validate-content.ts       # mentors↔ideas cross-check, runs prebuild
└── validate-sources.ts       # source-reliability rubric check, on demand
.claude/skills/persona-forge/  # the skill that distills new mentors
```

## On the panel (ethics)

Every panel evaluation and chat reply is an **AI-generated simulation**
based on each individual's public writings, talks, and patterns of thought.
The site footer and `/about` carry a permanent disclaimer; mentor reasoning
is written in their native voice using their own mental models, not an
average-of-all-AI tone. None of these are actual statements or endorsements
from the people simulated.

The panel is a forcing function for thinking, not a marketing claim.
