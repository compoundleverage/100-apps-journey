---
description: Quick-scaffold a v1-bootstrap mentor (for custom/fictional personas; use /persona-forge for real people)
argument-hint: (no args; the bun script prompts interactively)
---

You are running the mentor-add workflow.

Full skill notes at `.claude/skills/mentor-add/SKILL.md`.

**When to use this vs `/persona-forge`:**
- `/mentor-add` (this) — custom/fictional/private persona, no LLM research, instant scaffold
- `/persona-forge` — real public figure, 6-agent research + distillation, ~$1-2, 8-15 min

Action: run `bun run mentor:add` in the project root and pass the interactive prompts through to the user (they will type name, slug, accent, etc.). The script writes a minimum-valid `src/content/mentors/<slug>/SKILL.md`. When it finishes, surface the next-step hints it prints.
