# Karpathy — Writings (Agent 1)

## Canonical essays / blog posts

### 1. "Software 2.0" — Medium, Nov 11, 2017
[score: P=3 V=3 A=3 C=3 total=12]
URL: https://karpathy.medium.com/software-2-0-a64152b37c35

**Thesis (verbatim where possible):**
- Neural nets are not "just another classifier" — they represent a "fundamental shift in how we develop software."
- Central claim: "It is significantly easier to collect the data (or more generally, identify a desirable behavior) than to explicitly write the program."
- "Datasets are the new source code, model weights are the new binaries, gradient descent is the new compiler."
- Six computational benefits enumerated: homogeneity, silicon-friendliness, constant runtime, constant memory, portability, agility.
- Acknowledged limits: interpretability gap ("90% accurate model we understand, or 99% accurate model we don't"), silent bias adoption, adversarial examples.
- Calls out missing infra: "no Software 2.0 IDE", "no Software 2.0 Github."
- Tone: conversational + technical, self-aware ("I tried"), confident but not arrogant.

### 2. "Yes you should understand backprop" — Medium, Dec 19, 2016
[score: P=3 V=3 A=3 C=3 total=12]
URL: https://karpathy.medium.com/yes-you-should-understand-backprop-e2f06eab496b

**Thesis:**
- "The problem with Backpropagation is that it is a leaky abstraction."
- "TensorFlow automagically makes my networks learn" is a delusion.
- "95% of backpropagation materials out there present it all wrong, filling pages with mechanical math."
- TLDR-style summary at section ends ("**TLDR**: if you understand backpropagation...").
- Pedagogical stance: implementation forces understanding; framework abstractions hide failure modes.
- Vocabulary tells: "leaky abstraction", "magically", "sad", "yay", parenthetical ("(or tanh)"), "dead ReLU" framed as "permanent, irrecoverable brain damage."

### 3. "A Recipe for Training Neural Networks" — karpathy.github.io, Apr 25, 2019
[score: P=3 V=3 A=3 C=3 total=12]
URL: http://karpathy.github.io/2019/04/25/recipe/

**Two foundational observations:**
1. "Neural net training is a leaky abstraction" — clean APIs but plug-and-play is a lie.
2. **"Neural net training fails silently"** — recurring mantra across his work; misconfigured nets train anyway.

**6-step recipe:**
1. Become one with the data
2. Set up end-to-end skeleton + dumb baselines
3. Overfit (one batch first)
4. Regularize
5. Tune
6. Squeeze out juice

**Recurring mantras:**
- "Don't be a hero" (use proven architectures)
- "Visualize just before the net" (single source of truth)
- "Overfit one batch" (sanity check)
- "Complexify only one at a time"
- "A 'fast and furious' approach to training neural networks does not work and only leads to suffering."
- "Patience and attention to detail" — explicit virtue list.

### 4. "Deep Reinforcement Learning: Pong from Pixels" — May 31, 2016
[score: P=3 V=3 A=3 C=3 total=11]
URL: http://karpathy.github.io/2016/05/31/rl/
- Hands-on RL primer; sets the template "implement, don't just describe."

### 5. "microgpt" — karpathy.github.io, Feb 12, 2026
[score: P=3 V=3 A=3 C=2 total=11]
URL: http://karpathy.github.io/2026/02/12/microgpt/
- "It takes 200 lines of pure, dependency-free Python." Latest in the minimal-from-scratch series.

### 6. Eureka Labs founding announcement — July 16, 2024 (X tweet/post)
[score: P=3 V=3 A=3 C=3 total=12]
- Mission statement: "We are Eureka Labs and we are building a new kind of school that is AI native."
- "Subject matter experts who are deeply passionate, great at teaching, infinitely patient and fluent in all of the world's languages are very scarce and cannot personally tutor all 8 billion of us on demand."
- "Teacher + AI symbiosis" framing.
- First product: LLM101n.

### 7. "2025 LLM Year in Review" — bearblog, Dec 2025
[score: P=3 V=3 A=2 C=2 total=10]
URL: https://karpathy.bearblog.dev/year-in-review-2025/

**Six paradigm shifts identified:**
1. RL from Verifiable Rewards (RLVR) — "the de facto new major stage"
2. Jagged Intelligence / Ghosts vs Animals — "summoning ghosts" not "evolving animals"
3. Cursor as "a new app layer" — autonomy sliders
4. Claude Code — local LLM agents on private data
5. Vibe coding — "code is suddenly free, ephemeral, malleable"
6. Nano Banana / LLM GUI — visual-first interaction

**Distinctive phrasings:**
- "general apathy and loss of trust in benchmarks"
- "summoning ghosts"
- "spiking" capability
- "terraform software"
- "little spirit that lives on your computer"
- "Personally I suspect" (hedge)
- Less than 10% of potential realized

### 8. "Sequoia Ascent 2026" — karpathy.bearblog.dev
[score: P=3 V=3 A=2 C=2 total=10]
URL: https://karpathy.bearblog.dev/sequoia-ascent-2026/

**Concepts:**
- "Software 3.0": "humans program LLMs through prompts, context, tools, examples, memory, and instructions"
- "You can outsource your thinking, but you can't outsource your understanding"
- "Vibe coding raises the floor; agentic engineering raises the ceiling"
- December 2025 = "agentic inflection point"
- "Verifiable startup wedge" — domains economically valuable AND verifiable but undertrained
- "Sensors and actuators" framing for agent infra

## Recurring claims (≥ 3 occurrences across distinct works)

1. **"Read the code. Build it from scratch."** Pattern across nanoGPT, micrograd, llm.c, microgpt, nanochat, Zero to Hero. (Cross-referenced ≥10 distinct artifacts.)

2. **Leaky abstractions are dangerous.** Backprop essay (2016) → Recipe (2019) → Software 2.0 (2017) → Intro to LLMs (2023). Same lens, four distinct contexts.

3. **Software 2.0 / 3.0 progression.** Essay (2017) → multiple talks (2018-2024) → YC AI Startup School (June 2025) → Sequoia Ascent (2026). Same model, sharpened.

4. **Education as central mission.** CS231n (2015-2017) → Zero to Hero YouTube (2022-2024) → Eureka Labs (2024-) → LLM101n. Pattern: free, hands-on, code-first.

5. **Skepticism of black-boxing LLMs.** "LLMs as people spirits" tweets, Software 3.0 talk, Year in Review, Dwarkesh interview. Recurring rejection of "wrapper" framings; also rejection of "LLM-as-entity" — they are simulators.

## Self-coined terms / repurposed concepts

- "Software 2.0" / "Software 3.0"
- "Vibe coding" (Feb 2025)
- "Context engineering" (preferred over "prompt engineering")
- "People spirits" / "ghosts" for LLMs
- "Jagged intelligence"
- "March of nines"
- "Decade of agents" (vs "year of agents")
- "Cognitive core" (knowledge-stripped reasoning)
- "Autonomy slider"
- "LLM OS"

## Intellectual lineage citations (who he cites approvingly)

- **Geoff Hinton, Yann LeCun, Fei-Fei Li** (Hinton via U of Toronto; Fei-Fei was his PhD advisor at Stanford)
- **Richard Sutton** — engages publicly with the Bitter Lesson; disagrees on animals-vs-ghosts but treats it as the canonical opposing view
- **Schmidhuber, Bengio** — cited in CS231n materials
- **Alan Kay / xerox parc** — referenced in OS analogies
- Less commonly cites philosophers; more often cites OSS practitioners (Cursor, fast.ai, Ben Eater)

## Sentence-level style observations

- Mid-length declarative + parenthetical asides ("(or tanh)", "(but please keep the conspiracy theories coming as they are highly entertaining :))")
- Conclusion-first when annoyed; build-up when explaining
- Frequent "tldr" summaries
- "Just" / "simply" / "essentially" as scope-narrowing
- "Roughly", "I think", "I suspect", "imo" — calibrated hedges
- Asides marked by ":)" and ":(" — emoticon, never emoji
- Heavy use of "very" as intensifier, often paired with "neat" or "interesting"
- Conversational openers: "OK so", "Right so", "Quick note"

## INFORMATION DEPTH

This dimension is rich. Long-form public corpus available, with multiple high-Primacy 12/12 sources. No gaps.
