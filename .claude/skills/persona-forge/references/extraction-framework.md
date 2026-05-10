# Extraction Framework — From Research to Mental Models

Adapted from nuwa-skill's methodology. This is how Phase 2 turns 6-agent research into a runnable thinking framework.

## Core principle

> Capture **HOW they think**, not **WHAT they said**.

Quotes are evidence; they are not the model. The model is the underlying lens. A good distillation lets you predict what the subject would say about a *new* problem — not just retrieve what they said about an old one.

---

## 1. Mental model identification — triple validation

A claim becomes a **mental model** only if it passes all three tests. If it passes 1–2, it is downgraded to a **decision heuristic**. If it passes 0, it is discarded.

### Test 1: Cross-domain reproduction

The same framework appears in the subject's discussion of **at least two distinct domains**.

> Example — Naval's "leverage" concept appears in:
> - Wealth creation (code, media, capital, labor as leverage types)
> - Personal growth (specific knowledge × leverage = compounding)
> - Career choice (pick work with leverage in the structure)
> → 3 domains. ✓ Real mental model.

### Test 2: Generative power

You can use the model to **predict** the subject's likely position on a new problem.

> Example — If Munger's "inversion" is a mental model:
> - Asked "how to succeed?" he would first ask "how do I guarantee failure?"
> - Asked "how to invest?" he would first ask "how do I lose everything?"
> → Generates new inferences. ✓ Real mental model.

### Test 3: Exclusivity

Not every smart person reasons this way. The model captures the subject's *distinct* lens.

> Example — "Antifragility" is Taleb's, not a generic hedge-fund phrase. It excludes most other smart finance thinkers' lenses.
> → Has discriminating power. ✓ Real mental model.

### What about partial passes?

| Tests passed | Verdict |
|--------------|---------|
| 3 of 3 | Mental model. Include. |
| 2 of 3 | Decision heuristic — record as a rule with the missing dimension noted. |
| 1 of 3 | Personal preference — record only if structurally interesting. |
| 0 of 3 | Discard. The subject said it once; it isn't load-bearing. |

---

## 2. Expression DNA — quantify the voice

To make role-play pass the "could a familiar reader recognize this?" test, the voice must be measurable, not just adjectivally described.

### 2.1 Sentence fingerprint

From 20 randomly selected paragraphs of the subject's long-form work, measure:

| Metric | How to measure |
|--------|----------------|
| Average sentence length | total words / total sentences |
| Question-sentence ratio | # of questions / total |
| Analogy density | # of analogies / 1000 words |
| First-person frequency | "I" count / total words |
| Certainty-marker ratio | "obviously / clearly" vs "perhaps / might" |
| Concession frequency | "but / however / though" / 1000 words |

These aren't aesthetic — they catch the actual rhythm. A subject whose average sentence is 8 words sounds *different* from one whose average is 38, even if both are smart.

### 2.2 Style tags

Place the subject on each axis (1–5):

```
formal       1 — 2 — 3 — 4 — 5      colloquial
abstract     1 — 2 — 3 — 4 — 5      concrete
hedged       1 — 2 — 3 — 4 — 5      assertive
academic     1 — 2 — 3 — 4 — 5      vernacular
long-clause  1 — 2 — 3 — 4 — 5      short-clause
build-up     1 — 2 — 3 — 4 — 5      lead-with-conclusion
data-driven  1 — 2 — 3 — 4 — 5      narrative-driven
```

### 2.3 Forbidden words and tells

- **Words the subject never uses**: do not use them in role-play either. (e.g., Karpathy never writes "leveraging synergies".)
- **Tells / signature phrases**: use sparingly. Two per response is calibration; six per response is impersonation.

---

## 3. Contradiction handling

Contradictions are not bugs. They are the most distinctive part of a person's thinking.

### Three types

1. **Temporal** — the subject's view evolved over time.
   - Handling: record both with dates. Use the *recent* view as primary; mention the evolution as part of intellectual lineage.

2. **Domain-specific** — the subject applies different rules in different contexts.
   - Handling: record both, scoped. Don't try to unify them. Domain shifts are often *the* deepest insight.

3. **Constitutional tension** — values that genuinely conflict and the subject lives with the conflict.
   - Handling: record as `tensions` field. These are usually the most interesting part of the persona.

### Anti-patterns

- ❌ Picking one side and ignoring the other.
- ❌ Inventing a synthesis the subject never offered.
- ❌ Pretending the contradiction doesn't exist.

---

## 4. Insufficient information — handling honestly

| Situation | Response |
|-----------|----------|
| A dimension has very few public sources | Mark `boundaries` field: "Limited public material on X; this dimension is inferred." |
| Only second-hand sources for a claim | Lower confidence. Cite as "according to [source]" rather than asserting in subject's voice. |
| Sources contradict and you cannot pick | Present both. Let the user judge. Do not adjudicate. |
| Subject is publicly silent on a topic | Honor it. Note it explicitly. Do not extrapolate just to fill space. |

---

## 5. Person-Skill vs Topic-Skill

The persona-forge skill in this project is **person-Skill only** (mentors are individuals, not movements). nuwa-skill describes a topic-Skill variant; that variant is **out of scope** here. If a user asks for "value investing" rather than "Charlie Munger", redirect: "We forge individuals. Pick a representative person."

---

## 6. Quality gate (used in Phase 4)

A mentor SKILL.md passes validation when:

- **3–7 mental models**, each with ≥ 2 high-Primacy sources
- **5–10 decision heuristics**, each with at least one concrete example
- **Expression DNA** filled across all 6 sub-fields
- **≥ 2 internal tensions**
- **≥ 3 honest boundaries**
- **> 50% of cited sources are primary** (Primacy = 3 on the source-reliability rubric)

Below this floor → either return to Phase 1/2 to deepen, or downgrade to v1-bootstrap with explicit caveats.
