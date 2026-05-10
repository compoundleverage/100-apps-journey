---
description: Distill a named person into a mentor SKILL.md for the panel — 6-agent research, triple-validated mental-model extraction, quality-gated build
argument-hint: "<full name in quotes>" | --resume <slug> | --abort <slug> | --update <slug>
---

You are running the persona-forge workflow.

The full methodology is documented at `.claude/skills/persona-forge/SKILL.md`.
**Read that file first**, then execute the workflow it describes from Phase 0
through Phase 5. Also read its three reference files when needed:

- `.claude/skills/persona-forge/references/source-reliability.md`
- `.claude/skills/persona-forge/references/extraction-framework.md`
- `.claude/skills/persona-forge/references/skill-template.md`

The user's input is: $ARGUMENTS

Routing:
- If $ARGUMENTS starts with `--resume <slug>`: read `.persona-forge/wip/<slug>/STATE.md` and continue from the recorded phase. If no STATE.md exists, tell the user there is no in-flight forge for that slug.
- If $ARGUMENTS starts with `--abort <slug>`: delete `.persona-forge/wip/<slug>/` after confirming with the user.
- If $ARGUMENTS starts with `--update <slug>`: run only Phase 1 agents 2 (recent conversations), 5 (recent decisions), and 6 (timeline), merge with the existing `src/content/mentors/<slug>/SKILL.md`, preserving any text inside `<!-- MANUAL: ... -->` HTML-comment markers.
- If $ARGUMENTS is empty: enter Phase 0B (diagnose-then-recommend path). Ask 1-2 clarifying questions to localize the user's need, then propose 2-3 candidate persons.
- Otherwise: treat $ARGUMENTS as the named subject and enter Phase 0A (confirm spelling / lens / local material / budget acknowledgment).

Important:
- All in-flight artifacts go to `.persona-forge/wip/<slug>/` (gitignored). Do NOT touch `src/content/mentors/<slug>/` until Phase 5 atomic promotion after the quality gate passes.
- Use the source-reliability rubric (4 dimensions) — do not block sources by platform or language.
- Output is a SKILL.md whose frontmatter matches the schema in `src/content/config.ts` and whose body is short prose only. The system_prompt is a frontmatter field, NOT body content.
- Spawn the 6 research agents IN PARALLEL via the Agent tool — single message, six tool calls.
