# Source Reliability Rubric

> **Why this exists**: nuwa-skill's original platform/language blacklist (excluding 知乎、微信公众号、百度) was a coarse heuristic. The real signal is *content quality*, not platform. A long-form 知乎 essay with cited sources by a verifiable expert can be more reliable than a sloppy English blog. This rubric replaces blacklisting with structured scoring.

## The four dimensions

Score every information source on four orthogonal axes. Each scored **3** (high), **2** (mid), or **1** (low).

| Dimension | High (3) | Mid (2) | Low (1) |
|-----------|----------|---------|---------|
| **Primacy** | The subject's own original writing, recording, or interview transcript (verbatim) | Direct interview by named journalist, original reporting from a primary scene | Second-hand summary, paraphrase, translation, third-party retelling |
| **Verifiability** | Has explicit date, named author, citation chain or hyperlinks back to primary | Has date or named author but not both; or has source but no citation chain | Anonymous, undated, unsourced, or chain-broken |
| **Authority** | Peer-reviewed publication, established journalism, published book, the subject's own canonical channel | Established platform UGC (long-form blog with track record, recognized podcast, named-author posts on professional forums) | Anonymous forum post, content farm, AI-generated summary without provenance |
| **Corroboration** | ≥ 3 independent sources confirm the same claim | 2 independent sources confirm | Single source only |

A source's **total score** is the sum (4–12).

## Adoption rules

| Total | Use |
|-------|-----|
| **≥ 10** | Citable as primary evidence for any claim, including mental-model identification |
| **8–9** | Reliable supporting evidence; combine with at least one ≥10 source for major claims |
| **5–7** | Cross-reference only — never the sole source for a claim. Quote with caveat ("according to X, who claims to have heard...") |
| **≤ 4** | Background reading only. Do not cite directly. Use to find higher-quality sources via leads. |

## Mandatory thresholds

When distilling a mentor:

- **Mental models** must each be backed by **≥ 2 sources scoring ≥ 10 on Primacy** (i.e., the subject's own words across at least two distinct contexts). The triple-validation framework still applies — this is the source-quality floor under it.
- **Expression DNA** must be derived from **≥ 1 long-form (≥ 1000 words / ≥ 30 minutes) primary work** by the subject. You cannot reconstruct voice from tweets alone.
- **Decision heuristics** require **≥ 1 ≥10-source** plus **≥ 1 ≥8-source corroboration**.
- **Contradictions** must be preserved if both contradicting sources score **≥ 8**. Don't smooth them out — record as internal tension.

## Anti-patterns

- ❌ **Excluding sources by language or platform**. A French-language paper, a 微信公众号 long-form, or a Spanish podcast can all score 12 on this rubric. Score them; don't filter them.
- ❌ **Excluding sources by length**. A short tweet from the subject (Primacy 3, Verifiability 3, Authority 2 if from canonical account, Corroboration depends) can score 10–11. Length is captured implicitly by Primacy and Authority.
- ❌ **Treating all secondary sources as low**. A book-length biography by a careful journalist (Primacy 2, Verifiability 3, Authority 3, Corroboration 2 if widely cited) scores 10. It is reliable.
- ❌ **Treating all primary sources as high**. A subject's offhand tweet (Primacy 3) without context (Verifiability 1) and no corroboration (Corroboration 1) scores 6 — use with caution, especially if it contradicts longer-form positions.

## Process

For each source you reference during research (Phase 1):

1. Score it on all four dimensions in your own notes
2. Compute the total
3. Apply the Adoption rule
4. When citing in `references/research/0X-*.md`, append `[score: P=N V=N A=N C=N total=N]` after the citation

Example:
```markdown
- "Software 2.0" by Andrej Karpathy (Medium, 2017)
  https://karpathy.medium.com/software-2-0-a64152b37c35
  [score: P=3 V=3 A=3 C=3 total=12]
- Reddit thread r/MachineLearning discussion of Software 2.0 (2018)
  https://reddit.com/...
  [score: P=1 V=2 A=1 C=2 total=6]
  → cross-reference only
```

When the synthesis phase later reaches for evidence, it can mechanically check whether the threshold is met.

## Why scores rather than rules

Rules ("never use 知乎") encode a moment-in-time judgment. Scores encode *why* that judgment held. Most 知乎 posts score low on Primacy + Authority + Corroboration — that's the real reason they fail, not the platform name. A 知乎 post that happens to score 11 (e.g., a verified original post by the subject themselves with cited sources) should be usable. The platform-level rule would silently exclude it; the score-based rule includes it correctly.

This is a smaller, more honest filter, and it travels across languages.
