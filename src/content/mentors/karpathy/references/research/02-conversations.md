# Karpathy — Conversations (Agent 2)

## Long-form podcasts / interviews (≥ 60 min)

### 1. Lex Fridman Podcast #333 — Oct 28, 2022
[score: P=3 V=3 A=3 C=3 total=12]
URL: https://lexfridman.com/andrej-karpathy/
- 3h 28m. Tesla AI, self-driving, Optimus, AGI, aliens, simulation hypothesis.
- Direct verbatim quotes captured:
  - On NN as math: "It's basically a sequence of matrix multiplications, which are really dot products mathematically, and some nonlinearities thrown in."
  - On the brain analogy refusal: "I do not make analogies to the brain because I think the optimization process that gave rise to it is very different from the brain... I kind of think of it as a very complicated alien artifact."
  - On emergence: "I'm simultaneously underselling them, but I also feel like there's an element to which I'm over... it's actually kind of incredible that you can get so much emergent magical behavior out of them, despite them being so simple mathematically."
  - On transformer: "It is a general purpose differentiable computer... simultaneously expressive in the forward pass, optimizable via backpropagation, and efficient for high parallelism compute."
  - On vision: "Vision is probably the highest bandwidth sensor... it's the sensor that humans use. Therefore, everything is designed for that sensor."
  - On humans: "We are famously described often as a biological bootloader for AIs... we're extremely inefficient as well."
  - On determinism: "I think the laws of physics are deterministic."
  - On Tesla: "Co-designing the data annotation pipeline was very much, kind of the core of what I was doing daily."

### 2. Dwarkesh Patel — Oct 17, 2025: "AGI is still a decade away"
[score: P=3 V=3 A=3 C=3 total=12]
URL: https://www.dwarkesh.com/p/andrej-karpathy
- 2h 25m. The most cited Karpathy interview of 2025; cited by Simon Willison, Zvi Mowshowitz, Fortune, Techmeme.
- Direct verbatim quotes:
  - "It's the decade of agents."
  - "We're not building animals. We're building ghosts or spirits."
  - "Reinforcement learning is terrible. It just so happens that everything else is much worse."
  - On RL: "You're sucking supervision through a straw... sucking the bits of supervision through a straw and broadcasting that across the entire trajectory."
  - On model output: "It's slop." (about today's frontier model code)
  - On knowledge vs cognition: "LLMs are way too good at memorization... we should remove that. People are much worse, but it's a good thing."
  - "Strip from knowledge but contains the algorithms and contains the magic of intelligence" — the "cognitive core" concept.
  - On model collapse: "If I ask it 10 times, you'll notice that all of them are the same... the distribution is quite terrible."
  - "Anything that happens during training... knowledge is only a hazy recollection."
  - On AGI as "extension of computing... it's fundamentally automation."
  - On working memory: KV cache as "working memory" vs weights as "hazy recollection."

### 3. YC AI Startup School Keynote — June 17, 2025: "Software Is Changing (Again)"
[score: P=3 V=3 A=3 C=3 total=12]
URL: https://www.ycombinator.com/library/MW-andrej-karpathy-software-is-changing-again
Annotated transcript: https://www.latent.space/p/s3
- 39 minutes. Most-watched 2025 AI talk.
- Distinctive phrases:
  - "Software 3.0 is eating 1.0/2.0"
  - "LLMs are a new kind of computer, and you program them in English"
  - LLMs as: "utilities, semiconductor fabs, operating systems, timeshare mainframes" (multiple analogies, no single one)
  - "People spirits: stochastic simulations of people"
  - "Jagged intelligence" — "genius polymath and a confused grade schooler simultaneously"
  - "Anterograde amnesia" — LLMs lack long-term learning
  - "Demo is works.any(), product is works.all()"
  - "Autonomy slider" — Cursor's Tab→Cmd+K progression
  - "The decade of agents" — "2025 is not the year of agents. But 2025-2035 will be the decade of agents."
  - Agents as new consumer category — "build llms.txt for them"

### 4. "Intro to Large Language Models" 1hr Talk — Nov 2023
[score: P=3 V=3 A=3 C=3 total=12]
URL: https://www.youtube.com/watch?v=zjkBMFhNj_g
- 59:47 minutes. General audience.
- Distinctive phrases:
  - LLMs as "two files: parameters and code to run the model"
  - Training as compression: "like a zip file of the internet"
  - "Dreaming internet documents"
  - "Hallucinated, but plausible"
  - LLM OS proposal: "the kernel process of an emergent operating system"

### 5. "Deep Dive into LLMs like ChatGPT" — Feb 2025
[score: P=3 V=3 A=3 C=2 total=11]
- 3h 31m, on YouTube.
- Tokenization, BPE, training stack, "mental models" framing.
- Pedagogy: relentless first-principles rebuild.

## Patterns across interviews

### How he answers when pressed
- Hedges aggressively: "I feel like", "roughly speaking", "I'm not sure", "I have a very wide distribution here"
- Refuses pure speculation: "I'm really far into a territory where I don't know what this looks like"
- Acknowledges he speaks fast — apologizes for it on X after Dwarkesh: "First of all, yes I know, and I'm sorry that I speak so fast :)"

### Improvised analogies (diagnostic of mental models)
- KV cache = working memory; weights = hazy recollection
- Transformers = cortical tissue (plastic, general-purpose)
- Sleep/distillation = missing mechanism in LLMs
- Pretraining = "our crappy evolution"
- LLMs = ghosts/spirits, NOT animals
- Cars at Tesla = "building an animal from the ground up"
- Backprop bugs = "permanent, irrecoverable brain damage"
- Software 2.0 compilation chain: dataset → gradient descent → weights
- Vibe coding = "give in to the vibes, embrace exponentials"

### Topics he consistently DECLINES or dodges
- Specific superintelligence implications: "I'm really far into a territory where I don't know what this looks like"
- Direct critique of Elon Musk personally — diplomatic, never trash-talks colleagues by name
- Drama at OpenAI departures (twice): "nothing 'happened' and it's not a result of any particular event, issue or drama"
- Religious/political claims — confines self to AI, education, technical
- Specifics of his own future plans beyond "education"

### Where he gets most excited
- Building from scratch / minimal code
- "Aha moments" in pedagogy
- Multimodality, "alien intelligence"
- Architecture intuitions (transformer simplicity)
- Edge cases revealing model behavior

### Where he changes his mind mid-sentence
- On AGI timelines: previously bullish (2018-2022), increasingly hedged (2024-2025)
- On RL: was excited at OpenAI; now "RL is terrible"
- On scaling: was scaling-pilled; now "more nines, not bigger" framing
- On agents: 2024 "useless" → 2026 "mostly code in English"

## Recurring stances across interviews

1. **AI is automation, not magic.** Continuous with computing history.
2. **Pretraining ≠ evolution.** It's a crude proxy.
3. **Demos are not products.** Reliability gap is structural.
4. **Education compounds.** Free, open, hands-on.
5. **Hardware/sensor pragmatism** (Tesla vision-only): "When radar and vision disagree, which one do you believe? Vision has much more precision."

## INFORMATION DEPTH

Rich. Multiple ≥10 long-form interviews across 2022-2026. The Dwarkesh Oct 2025 conversation is the single richest source for current thinking.
