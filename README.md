# 100 Apps Journey

A public ledger of small app experiments — 100 attempts in 100 days, each
evaluated by an AI panel of five investors with strong personalities and
stronger opinions.

The differentiator is the panel: every entry is scored by AI simulations of
**Andrej Karpathy, Elon Musk, Garry Tan, Naval Ravikant, and Paul Graham**.
They don't divide labor by topic — each one reasons in their full voice, and
the disagreement is the signal.

## Stack

- **Astro 5** static site, **Tailwind v4** via Vite plugin
- **Bun** runtime + package manager
- **TypeScript strict**
- **`@anthropic-ai/sdk`** for panel evaluations (Claude Sonnet 4.6 default)
- Content as Markdown with Zod-validated frontmatter

## Local development

Requires Node 22+ (for Astro tooling) and Bun.

```bash
nvm use 22       # if you use nvm
bun install      # first time
bun run dev      # http://localhost:4321
bun run build    # static output to dist/
bun run preview  # preview prod build
```

## Adding an idea

Create a new file in `src/content/ideas/` named `NNN-slug.md`:

```yaml
---
id: 2
title: "Your idea title"
status: idea           # idea | building | shipped | killed
date_added: 2026-05-08
thesis: "Why this could be valuable, in one or two sentences."
kill_criteria: "When to retire this without sentiment."
time_budget: "1d"      # 1h | 4h | 1d | 2d | etc
tags: [productivity, ai-native]
investor_evaluations: []
---

# Body markdown — design notes, retrospective, lessons learned.
```

Frontmatter is type-checked at build time via `src/content/config.ts`.

## Generating panel evaluations

After writing the markdown, fill the panel automatically:

```bash
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env
bun run evaluate 002-your-slug   # one idea
bun run evaluate --all           # all ideas
bun run evaluate --all --model=claude-haiku-4-5-20251001  # cheaper
```

The script calls Claude once per persona per idea and writes structured
`{ score, reasoning, generated_at, model }` back into frontmatter. Cost
is well under $0.01 per idea on Sonnet 4.6.

## Project shape

```
src/
├── content/
│   ├── config.ts            # Zod schema for ideas collection
│   └── ideas/*.md           # one entry per app attempt
├── lib/
│   ├── panel.ts             # 5 personas + system prompts
│   └── scoring.ts           # average / status helpers
├── components/
│   ├── StatusBadge.astro
│   ├── IdeaCard.astro
│   └── InvestorPanel.astro  # 5-card scoreboard, "AI Sim" label
├── layouts/Layout.astro     # masthead + footer disclaimer
├── pages/
│   ├── index.astro          # the pipeline
│   ├── ideas/[slug].astro   # single entry
│   ├── stats.astro          # the standings
│   └── about.astro          # the methodology
└── styles/global.css        # Tailwind v4 @theme + prose-journal
scripts/
└── evaluate.ts              # Claude API panel evaluator
```

## On the panel (ethics)

Every panel evaluation is an **AI-generated simulation** of how a person
might evaluate, based on their public writings and talks. Cards are clearly
labeled "AI Sim", reasoning is written in conditional voice, and the site
footer carries a permanent disclaimer. None of these are actual statements
or endorsements from the people pictured.

The panel is a forcing function for thinking, not a marketing claim.
