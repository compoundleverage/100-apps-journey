---
description: Delete a mentor with cascade cleanup of ideas/*.md investor_evaluations
argument-hint: <slug>
---

You are running the mentor-delete workflow.

Full skill notes at `.claude/skills/mentor-delete/SKILL.md`.

The user's input is: $ARGUMENTS

Action: take the slug from $ARGUMENTS and run `bun run mentor:delete <slug>` in the project root. The script prints how many idea evaluations will be affected and then prompts for `y/N` confirmation. Pass the script's prompt through to the user verbatim; do NOT auto-confirm. After the user answers, surface the result.

If $ARGUMENTS is empty, ask the user which mentor slug to delete. Available slugs: list directories under `src/content/mentors/`.
