---
name: mentor-add
description: |
  Quick-scaffold a v1-bootstrap mentor SKILL.md for custom or fictional personas.
  Thin wrapper that runs `bun run mentor:add` interactively — derives slug,
  prompts for bio, accent, system_prompt; writes a minimal-valid SKILL.md
  satisfying the content schema.

  Use for: custom personas, fictional characters, collaborators not in public
  sources, or quick stubs you'll later upgrade.

  For real public figures (people with books, talks, interviews you can mine),
  use `/persona-forge` instead — it runs 6-agent research and distillation.

  Triggers: "/mentor-add", "add a custom mentor", "scaffold mentor",
  "造一个自定义 mentor", "add a mentor without distillation".
---

# /mentor-add — quick mentor scaffold

This is a thin wrapper around the `bun run mentor:add` CLI script. The script
does the heavy lifting — this skill just hands it off and routes the prompts
back to the user.

## When to use this vs `/persona-forge`

| Need | Use |
|---|---|
| Add a real public figure (Steve Jobs, Naval, Karpathy) | `/persona-forge` — 6-agent research, public-source distillation, ~$1-2 |
| Add a custom/fictional persona or your own character | `/mentor-add` (this) — instant stub, no LLM research |
| Add someone with private/non-public material | `/mentor-add` — then hand-edit, or use `/persona-forge --resume` with local sources |

## How to run it

Just run:

```bash
bun run mentor:add
```

Pass the script's interactive prompts (name, slug, bio, initials, accent, epitaph, system_prompt) through to the user. When the script finishes, surface the next-step hints it prints — typically a pointer to run `bun run dev` to preview, or `/persona-forge --update <slug>` to upgrade the stub to v2-distilled.

## Where it writes

`src/content/mentors/<slug>/SKILL.md` with `version: v1-bootstrap` and stub fields. After it lands, the mentor immediately appears in the catalog at `/mentors` and is selectable from any visitor's bench.

Builder can also add it to default-seated by editing `DEFAULT_SEATED_SLUGS` in `src/lib/seated.ts`.
