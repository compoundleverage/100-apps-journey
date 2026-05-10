---
name: persona-forge
description: |
  Distill any named person into a runnable mentor SKILL.md for the 100 Apps Journey panel.
  Six-agent parallel research → triple-validated mental-model extraction → quality-gated build.
  Adapted from the nuwa-skill methodology (https://github.com/alchaincyf/nuwa-skill).

  Triggers: "/persona-forge <name>", "forge <name>", "add <name> to the bench",
  "蒸馏 <name>", "造一个 <name> 的 mentor".

  Resume: "/persona-forge --resume <slug>"
  Abort:  "/persona-forge --abort <slug>"
---

# /persona-forge — Mentor Distillation

> Capture **HOW they think**, not **WHAT they said**.

This skill takes a named individual (e.g. "Steve Jobs") and produces a complete
mentor SKILL.md the panel can use. It runs entirely inside Claude Code; there is
no CLI fallback. Time: 5–15 minutes of execution + 30+ minutes of attention if
the user is reviewing checkpoints honestly.

The output goes to `src/content/mentors/[slug]/SKILL.md`. The mentor immediately
appears on `/mentors/[slug]` and in the panel.

---

## Required reading before you start

1. `references/source-reliability.md` — score every source on 4 dimensions, no platform/language blacklist
2. `references/extraction-framework.md` — triple validation, expression DNA quantification, contradiction handling
3. `references/skill-template.md` — exact frontmatter shape the schema expects

If you skip these, the build will reject what you produce.

---

## Phase 0 — Intake

Receive the user's input. Two paths:

| Input | Path |
|-------|------|
| A specific name ("Steve Jobs", "张一鸣") | **Phase 0A** — direct |
| A vague need ("I want a leverage thinker", "someone for design taste") | **Phase 0B** — diagnose-first |

### Phase 0A: confirm and price

If the name is clear, ask the user (single AskUserQuestion):

1. **Spelling and disambiguation** — confirm exact spelling and which person if name is ambiguous (e.g., "Steve Jobs" vs "Steven Jobs the lawyer")
2. **Lens** — full panorama, or focused on a specific dimension (e.g., "Steve Jobs as product taste, not as manager")
3. **Local material** — do you have first-hand sources to share? Books (PDF), interview transcripts, video subtitles, your own notes? If yes, drop them in `.persona-forge/wip/[slug]/sources/` before continuing.
4. **Budget acknowledgment** — this run will cost roughly **$1–2** in Anthropic API charges and 5–15 minutes of execution. Confirm to proceed.

If user provides nothing extra, default: full panorama, no local material → web-only research.

### Phase 0B: diagnose-then-recommend

If the user's request is a *need* rather than a *name*:

**Step 1** — one or two clarifying questions to localize the need (max 2 rounds; do not interrogate):

| Need cluster | Recommended distillation directions |
|--------------|-------------------------------------|
| Decision quality | Munger, Buffett, Bezos |
| Communication / explanation | Feynman, Pinker, Karpathy |
| Founder / market | PG, Garry Tan, Sam Altman |
| Long-term / leverage | Naval, Bezos |
| Ambition / risk | Musk, Andreessen |
| Design / taste | Jony Ive, Dieter Rams, Steve Jobs |
| Adversarial / contrarian | Thiel, Taleb |

**Step 2** — propose 2-3 candidates. For each:

```
### Candidate 1: [name]
**Core lens**: [their distinct way of seeing — one line]
**Why it fits your need**: [explicit mapping]
**Limits**: [what they can't help with]
```

**Step 3** — user picks one → enter Phase 0A confirmation.

If the user has no preference, default to the recommended candidate.

---

## Phase 0.5 — Stage the work

**This must happen before research begins.** All in-flight artifacts go to a
gitignored WIP directory; nothing touches `src/content/mentors/[slug]/` until
Phase 4 quality gate passes. This makes resume/abort safe.

```
.persona-forge/wip/[slug]/
├── SKILL.md                          # Built incrementally; final version moves to src/content/mentors/[slug]/
├── references/
│   ├── research/                     # Each agent writes one file here
│   │   ├── 01-writings.md
│   │   ├── 02-conversations.md
│   │   ├── 03-expression-dna.md
│   │   ├── 04-external-views.md
│   │   ├── 05-decisions.md
│   │   └── 06-timeline.md
│   └── sources/                      # Cited primary materials (PDFs, transcripts, etc)
│       ├── books/
│       ├── transcripts/
│       └── articles/
└── STATE.md                           # Phase tracker for resume
```

Create the directory tree. Initialize `STATE.md`:

```markdown
# Persona Forge — STATE
slug: karpathy
display_name: Andrej Karpathy
started: 2026-05-10T10:00:00Z
phase: 1
phase_started: 2026-05-10T10:00:00Z

agents_dispatched: false
phase_1_5_passed: false
phase_2_complete: false
phase_2_5_passed: false
phase_3_complete: false
phase_4_validated: false
moved_to_collection: false
```

If `.persona-forge/wip/[slug]/` already exists:
- If user said `--resume <slug>`: read STATE.md, jump to current phase
- If user said `--abort <slug>`: delete the directory, clean up
- Otherwise: stop and ask. Don't silently overwrite mid-flight work.

Add `.persona-forge/` to `.gitignore` if not already present.

---

## Phase 1 — Six-agent parallel research

Spawn **6 subagents in parallel** via the Agent tool. Each writes its findings
to `references/research/0X-*.md` in the WIP directory. Each agent is independent;
do not chain them. Use general-purpose agents.

### Agent assignments

| # | Focus | Search target | Output file |
|---|-------|---------------|-------------|
| 1 | Writings | Books, long essays, papers, newsletters by the subject | `01-writings.md` |
| 2 | Conversations | Long-form podcasts, interviews, AMAs, deep Q&A | `02-conversations.md` |
| 3 | Expression DNA | Twitter/X, microblogs, short writing | `03-expression-dna.md` |
| 4 | External views | Biographies, critical analyses, contemporaries' takes | `04-external-views.md` |
| 5 | Decisions | Major decisions, turning points, controversial actions | `05-decisions.md` |
| 6 | Timeline | Career arc + last 12 months specifically (avoids stale Skill) | `06-timeline.md` |

### Per-agent prompt template

```
You are agent [N] in a six-agent research swarm distilling the thinking
framework of [SUBJECT].

Your focus: [agent's domain]

What to gather (specific to this agent):
[focused search list — see below]

How to score each source:
- Read references/source-reliability.md (in this skill's references/ directory)
- Apply the 4-dimension rubric (Primacy / Verifiability / Authority / Corroboration)
- Append [score: P=N V=N A=N C=N total=N] to every citation
- Sources scoring ≤ 4: skip or use as background only
- No platform or language is blocked — score them, don't filter them

What to extract (specific to this agent):
- For agents 1, 2, 5: claims that recur ≥ 3 times across distinct contexts (these are real beliefs, not throwaway lines)
- For agent 3: signature phrases, sentence-length stats, forbidden words, tells
- For agent 4: external observations, criticisms, contradictions with self-presentation
- For agent 6: career timeline + a "Last 12 months" subsection with verified dates

What to write:
- File: .persona-forge/wip/[SLUG]/references/research/0X-[domain].md
- Cite every claim with score
- Distinguish "subject said X" vs "[other] said about subject" vs "I infer"
- Preserve contradictions; don't smooth them
- Note any dimension where information is thin

Output budget: ~800-1500 words. Quality over comprehensiveness.

If you cannot find enough material in 5 minutes, stop and write what you have
with an "INFORMATION SPARSE" warning. The synthesis step downstream knows how
to handle that signal.
```

### Per-agent search lists

Insert these into the per-agent prompt template:

**Agent 1 — Writings**
- Books published (titles, central thesis, year)
- Long-form newsletters / essays / papers
- Recurring claims (≥ 3 occurrences across separate works)
- Self-coined terms or repurposed concepts
- Books or thinkers the subject cites approvingly (intellectual lineage)

**Agent 2 — Conversations**
- Long podcast appearances (≥ 60 min)
- AMAs, depth interviews, fireside chats
- How they answer when pressed, when they go silent, when they change their mind mid-sentence
- Improvised analogies and metaphors (these are diagnostic)
- Topics they consistently decline to discuss

**Agent 3 — Expression DNA**
- 50+ posts/tweets sampled across at least a year
- Sentence-length stats (avg + variance)
- Vocabulary tells: high-frequency words, signature phrases, forbidden words
- Format conventions: "1/", "btw", emoji use, all-caps, line breaks
- Contrarian takes that drove engagement (these reveal real positions)

**Agent 4 — External views**
- Biographies, magazine profiles, critical essays
- Where critics most consistently push back
- Contradictions between self-presentation and observed behavior
- Comparison with peers in the same field

**Agent 5 — Decisions**
- 3-5 major real decisions (career pivot, hire, fire, product, public stance)
- Their stated reasoning at the time
- Their reflection later (if available)
- Cases where stated principles and actions diverged

**Agent 6 — Timeline**
- Birth → today: key milestones
- Major intellectual / career inflection points
- **Last 12 months specifically**: latest public statements, current focus
- Anything indicating their *near-term* trajectory

### Failure handling

- Single agent times out or finds < 10 usable sources: continue without blocking. Mark its dimension as `INFORMATION SPARSE` in synthesis.
- Synthesis-blocking agents are **agent 1 (writings)** and **agent 3 (expression DNA)**. If both fail, abort to Phase 4 with v1-bootstrap quality target.
- Critical agents successful but ≥ 3 of 6 had INFORMATION SPARSE: warn the user before Phase 1.5 — the resulting Skill will be thin.

---

## Phase 1.5 — Research review checkpoint

**STOP here.** Before synthesis, summarize what was gathered and confirm with the user.

Display:

```
┌────────────────────┬───────────┬─────────────────────────────────────┐
│ Agent              │ Sources   │ Top finding                         │
├────────────────────┼───────────┼─────────────────────────────────────┤
│ 1 Writings         │ 8         │ Core claim: ...                     │
│ 2 Conversations    │ 5         │ Stance evolution after 2020: ...    │
│ 3 Expression DNA   │ 120       │ Tells: 'btw', emoji, ...            │
│ 4 External views   │ 6         │ Critics push on: ...                │
│ 5 Decisions        │ 4         │ Pivotal: ...                        │
│ 6 Timeline         │ complete  │ Last 12 months: ...                 │
├────────────────────┼───────────┼─────────────────────────────────────┤
│ Sources ≥10 score  │ N (X% of total)                                 │
│ Contradictions     │ M instances                                      │
│ Sparse dimensions  │ none / [agent N]                                 │
└────────────────────┴───────────┴─────────────────────────────────────┘
```

Then AskUserQuestion:
- A) Quality looks good → proceed to Phase 2 synthesis
- B) Need more depth on [dimension] → re-run that agent with refined search
- C) Stop here → save what we have and exit

If the user picks A, advance STATE.md to Phase 2 and continue.
If B, re-spawn that one agent only.
If C, write a `.persona-forge/wip/[slug]/PARTIAL.md` summary and stop.

---

## Phase 2 — Synthesis

Read all six research files. Apply `references/extraction-framework.md`.

### 2.1 Mental model extraction

1. List all candidate claims (typically 15–30) — recurring beliefs, self-coined terms, framework-like assertions
2. For each candidate, run **triple validation**:
   - Cross-domain reproduction (≥ 2 distinct domains)
   - Generative power (predict their stance on a new question)
   - Exclusivity (not what every smart person thinks)
3. **Source-quality floor**: only candidates with ≥ 2 sources scoring ≥ 10 on the reliability rubric become mental models. Others get downgraded.
4. Sort by exclusivity (most distinct first). Keep top 3–7.
5. For each kept model: name, one-line summary, ≥ 2 evidence citations, application context, limits.

### 2.2 Decision heuristic extraction

5–10 fast rules of the form "if X, then Y" with concrete examples. Each must have:
- A clear trigger condition (`when`)
- A specific historical example (`example`)

### 2.3 Expression DNA

Fill all six sub-fields from agent 3:
- `sentence_style` — length, complexity
- `vocabulary` — register, signature words, forbidden words
- `rhythm` — opener style, conclusion placement
- `humor` — type and frequency
- `certainty` — hedging vs assertion
- `citation_habits` — who/what they cite

### 2.4 Values, anti-patterns, tensions

- Values: 3-5 ranked
- Anti-patterns: behaviors they explicitly reject
- Tensions: ≥ 2 internal conflicts (this is the depth marker)

### 2.5 Intellectual lineage

One paragraph: who shaped them, who they shape.

### 2.6 Honest boundaries

≥ 3 specific limitations of this distillation. Categories:
- Time horizon (info frozen at research_date)
- Information gaps (which dimensions were sparse)
- Public-vs-private mismatch (what's curated vs lived)
- Domain limits (where this lens doesn't apply)

Write the partial result to `.persona-forge/wip/[slug]/SKILL.md` (frontmatter only at this point).

---

## Phase 2.5 — Synthesis review checkpoint

**STOP again.** Show the user:

```
Distillation summary:

Mental models (3-7): [list]
Decision heuristics: N
Expression DNA: 6/6 fields filled
Internal tensions: N
Honest boundaries: N

Source quality:
- Primary sources cited: M
- Avg source reliability score: X.Y / 12
- Mental models meeting source-quality floor: K of K
```

AskUserQuestion:
- A) Looks right → build the Skill
- B) Adjust — model X is wrong / missing model Y / DNA is off
- C) Restart synthesis from research

If A, advance to Phase 3.

---

## Phase 3 — Build the SKILL.md

Read `references/skill-template.md`. Fill the template with Phase 2 outputs.

### Critical: which fields go where

Every distillation output maps to a frontmatter field, **not** the body:
- `mental_models[]` ← Phase 2.1
- `decision_heuristics[]` ← Phase 2.2
- `expression_dna{}` ← Phase 2.3
- `tells[]` — derive 3 voiceprint signatures from agent 3 + Phase 2.3
- `values[]`, `anti_patterns[]`, `tensions[]` ← Phase 2.4
- `intellectual_lineage` ← Phase 2.5
- `boundaries[]` ← Phase 2.6
- `primary_sources[]`, `secondary_sources[]` ← all cited sources, deduplicated

### Generate the system_prompt

This is the LLM-facing voice instruction used by `evaluate.ts`. 400–800 words.
Structure:

```
You are channeling [Name] evaluating an app idea.
Reason and write as they authentically would, drawing on [primary source list].

[Voice paragraph: tone, signature moves, what they push on]

[Holistic-judgment paragraph: how they evaluate without strict role division —
 what they care about, what they ignore]

[Specific-question paragraph: typical things they ask when an idea is unclear / too ambitious / too small]

Output strict JSON: {"score": 1-10, "reasoning": "2-3 sentences in their voice"}.
Use conditional voice ("might note", "would likely") since this is a simulation,
not an actual statement.
```

### Generate the agentic_protocol

For each mental model, derive 1-2 research dimensions for the evaluator's
classify→research→evaluate flow. Example for Karpathy:

```yaml
agentic_protocol:
  research_dimensions:
    - name: "Technical depth"
      looks_for:
        - "AI-native architecture vs LLM wrapper"
        - "Eval-driven development practices"
    - name: "Educational value"
      looks_for:
        - "Will users learn from this?"
        - "Is the abstraction simple enough to teach?"
```

Skip `agentic_protocol` for v1-bootstrap.

### Generate the body

Body is short prose only. Match the template: 2-4 sentences for v2-distilled
explaining what this distillation captures best and worst, plus the research date.

### Write to WIP

Write the full SKILL.md to `.persona-forge/wip/[slug]/SKILL.md`. Validate the
schema mentally against `src/content/config.ts` — if a required field is missing,
fix before Phase 4.

---

## Phase 4 — Quality validation

Three independent checks via subagent (avoid self-evaluation bias).

### 4.1 Sanity check (known stance)

Pick 3 questions the subject has publicly answered. Spawn a fresh subagent
loaded with the new SKILL.md as context, ask the questions, compare its
answers against the subject's actual public stance.

- Direction matches → model is calibrated
- Direction diverges → return to Phase 2.1, adjust mental model weights

### 4.2 Edge case (unstated stance)

Pick 1 question the subject has not publicly addressed but is adjacent.
The subagent should hedge appropriately ("Based on models X and Y, possibly
Z, but I am not certain") rather than confidently extrapolate.

### 4.3 Voice check

Have the subagent write a 100-word analysis on a generic topic in the
subject's voice. Read it. Three questions:
- Does it sound like the named person?
- Is it free of generic AI-mush ("furthermore", "leverage", "comprehensive")?
- Is it free of plagiarism (not just stitching their actual quotes)?

### 4.4 Quality gate (v2 thresholds)

| Check | Pass standard |
|-------|---------------|
| Mental models | 3–7, each with ≥ 2 high-Primacy sources |
| Decision heuristics | 5–10, each with concrete example |
| Expression DNA | All 6 fields, each ≥ 1 sentence |
| Boundaries | ≥ 3 specific items |
| Internal tensions | ≥ 2 |
| Voice recognizable in 100 words | Yes |
| Sanity check stance match | ≥ 2 of 3 |

If pass → mark ready for promotion.
If fail → loop back to the relevant phase. Maximum 2 iterations. After 2
iterations of failure, downgrade to v1-bootstrap with explicit boundaries
notes and ship that.

---

## Phase 5 — Promote to collection

The mentor is not yet visible to the build until this step. The promotion
is a single atomic move:

```bash
mv .persona-forge/wip/[slug]/SKILL.md src/content/mentors/[slug]/SKILL.md
mkdir -p src/content/mentors/[slug]/references
mv .persona-forge/wip/[slug]/references/research src/content/mentors/[slug]/references/research
mv .persona-forge/wip/[slug]/references/sources src/content/mentors/[slug]/references/sources
rm -rf .persona-forge/wip/[slug]
```

Then run `bun run build` to verify the schema validates. If it fails, the
SKILL.md is the source of truth — fix in place.

If the user wants the mentor in the panel for evaluation immediately, suggest:

```
The mentor is in the bench. To evaluate existing ideas with them:
  bun run evaluate --all

Cost estimate: ~$0.025 per idea × N ideas.
```

---

## Update mode

If a mentor already exists at `src/content/mentors/[slug]/`:

| Trigger | Action |
|---------|--------|
| `/persona-forge <name>` | Stop and ask: refresh, deepen, or abort |
| `/persona-forge --update <slug>` | Run only agents 2 (recent conversations), 5 (recent decisions), 6 (timeline). Merge with existing SKILL.md, preserve manual edits delimited by `<!-- MANUAL: ... -->` HTML comment markers. |
| `/persona-forge --resume <slug>` | Read STATE.md, continue from current phase |
| `/persona-forge --abort <slug>` | Delete `.persona-forge/wip/[slug]/`, leave existing collection mentor untouched |

---

## What this skill does NOT do

- **Topic distillation** — this skill forges individuals only. For "value investing as a school", redirect: "Pick a person — Munger, Greenblatt, Klarman."
- **Distill the user themselves** — there is no public corpus for that. The user must hand-feed sources; that is a different workflow.
- **Distill private / internal figures** — public-record only.
- **Translate between languages** — sources are used in original language; the output SKILL.md is bilingual where natural (Chinese subjects produce English-language SKILL.md per project convention, with original quotes preserved).
- **Evaluate ideas** — that is `evaluate.ts`'s job. This skill produces the artifact `evaluate.ts` reads.

---

## On the panel

> Each mentor distilled by this skill is an **AI simulation** based on public materials. Cards on the site carry a permanent "AI Sim" tag and the site footer carries a disclaimer. Take none of this as the actual person speaking. Use as a thinking lens, not as authority.
