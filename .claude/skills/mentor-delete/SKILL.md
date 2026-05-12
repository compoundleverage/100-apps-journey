---
name: mentor-delete
description: |
  Delete a mentor with cascade cleanup of idea evaluations. Thin wrapper around
  `bun run mentor:delete <slug>`, which removes `src/content/mentors/<slug>/`
  AND scrubs any `investor_evaluations[].persona === <slug>` entries from
  every `src/content/ideas/*.md` so `bun run validate-content` stays clean.

  Triggers: "/mentor-delete <slug>", "delete mentor <slug>", "remove mentor",
  "删除 mentor <slug>".
---

# /mentor-delete — delete mentor with cascade cleanup

Thin wrapper around the `bun run mentor:delete` CLI. The script handles
discovery, confirmation, and the two-stage write order (ideas first, then
mentor dir) so a mid-flight crash leaves a re-runnable state.

## How to run it

Take the slug from `$ARGUMENTS`. If empty, list `src/content/mentors/` and ask
the user which slug to delete.

```bash
bun run mentor:delete <slug>
```

The script will:
1. Verify the mentor directory exists.
2. Scan `src/content/ideas/*.md` and report how many evaluations reference the slug.
3. Print a `y/N` confirmation prompt.

**Do NOT auto-confirm.** Pass the prompt through to the user verbatim. After
the user types `y`, the script writes the cleaned idea files first, then
removes the mentor directory. Surface the final summary it prints.

## Aftermath

- The mentor disappears from the catalog at `/mentors`.
- Any idea pages that had scored evaluations from that mentor lose those entries (still in git history if you need to recover).
- If the slug was in `DEFAULT_SEATED_SLUGS` (`src/lib/seated.ts`), `bun run validate-content` will print a yellow warning. Edit the constant to remove the dead slug.
- Visitors with the slug saved in their localStorage `seated:v1` will silently drop it on next page load (the `filterSeated` helper handles unknown slugs).

## Don't use this for

- Renaming a mentor — just edit the SKILL.md frontmatter; the slug = directory name, so renaming = rm + add.
- Hiding a mentor temporarily — there's no hide flag in the schema. Either delete or leave in. Visitors can unseat individually.
