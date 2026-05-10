---
id: 1
title: 100 Apps Journey
status: shipped
date_added: 2026-05-10T00:00:00.000Z
date_started: 2026-05-10T00:00:00.000Z
date_shipped: 2026-05-10T00:00:00.000Z
thesis: >-
  做一个 idea tracker 没差异化，但做一个公开的 100 天 build-in-public 日志，把 angel investor
  的评判落到产品里——AI 模拟 6 位真实人物（含 v2-distilled 的 Steve
  Jobs）逐个评分——叙事张力和工具价值就能合一。Journey 本身就是 content。
kill_criteria: 如果当天 ship 不出本地可跑的 v1，重新评估方法论；如果四周后 ideas 列表少于 20 个，说明 100-app 节奏立不住，撤退。
time_budget: 1d
actual_time: 1d
tags:
  - meta
  - productivity
  - build-in-public
  - ai-native
disclosure: full
investor_evaluations:
  - persona: steve-jobs
    mentor_version: v2-distilled
    score: 4
    reasoning: >-
      The builder would likely note that this is a cabinet where the front looks
      interesting and the back is someone else's wood — Claude's API owns the
      experience the moment Anthropic changes a pricing tier or a safety filter,
      and that's not a product, that's a tenant arrangement. The 'panel of
      investors' conceit might strike him as clever in the way a hall of mirrors
      is clever: six simulations of judgment stacked inside a simulation of a
      journey, and somewhere in that recursion the actual user on Tuesday
      morning disappears entirely — who is riding this bicycle, and where are
      they going? He would also want to know what got killed; the write-up lists
      everything that was added and nothing that was refused, which is the tell
      of a person who hasn't focused yet — a product is the pile of nos, not the
      pile of yeses — and shipping in one day is real craftsmanship only if the
      one day was ruthless, not just fast.
    generated_at: '2026-05-10T03:55:58.368Z'
    model: claude-sonnet-4-6
  - persona: karpathy
    mentor_version: v2-distilled
    score: 6
    reasoning: >-
      The meta-recursiveness is genuinely clever — the tracker hosts the
      journey, the journey validates the tracker, Day 1 ships the infrastructure
      for Days 2-100, that's clean design thinking and I respect the commit. The
      'panel of real AI simulations with visible disagreement' is actually the
      right instinct: divergence between simulated-Karpathy and simulated-Naval
      on the same idea IS the information, not noise, and labeling it clearly as
      simulation is the right epistemic hygiene. But I'd push hard on a few
      things: the persona-forge pipeline (6 research agents, 3 validators,
      'v2-distilled Jobs') sounds like it produces confident-sounding slop
      unless there's a real eval — like, what's the ground truth you're
      distilling against? A persona is only as good as the behavioral test set
      that validates it, and 'quality gate' without specifying what passes or
      fails the gate is vibes-driven development. The 200-line
      build-from-scratch test also bites here: the Astro + markdown + Claude API
      stack is fine, but the actual moat is supposed to be the persona quality,
      and I suspect the persona quality is not robustly measured anywhere —
      you'd know if you tried to catch a known misfire. The other concern is the
      autonomy slider: this sits comfortably in 'works.any()' territory right
      now (cool demo, first few evals feel sharp) and getting to 'works.all()' —
      where the simulated panel is reliably more useful than just asking Claude
      directly — requires exactly the kind of boring eval infrastructure that a
      one-day ship can't contain. The 100-app pace is also a distribution bet
      more than a product bet, which is fine, but it means the interesting
      question isn't 'is this a good tracker' but 'does the narrative compound'
      — and that's a distribution/writing problem, not an engineering one, so
      the agent parallelism story is a little beside the point.
    generated_at: '2026-05-10T03:56:03.753Z'
    model: claude-sonnet-4-6
  - persona: musk
    mentor_version: v2-distilled
    score: 4
    reasoning: >-
      This might score higher if the 100-app constraint were actually
      load-bearing — but a tracker that tracks its own trackers is recursive
      vanity, not a civilizational primitive. The 'differentiation' is a panel
      of AI personas scoring app ideas, which costs essentially $0 in tokens and
      maybe 40 hours to build the persona-forge pipeline — low idiot index, fine
      — but the output is entertainment, not leverage on any physical or
      informational bottleneck that matters. Most likely outcome: compelling
      Twitter content for 6 weeks, abandoned at app #23 when the narrative
      exhausts itself and no one is paying for the scores.
    generated_at: '2026-05-10T03:55:56.113Z'
    model: claude-sonnet-4-6
  - persona: garry-tan
    mentor_version: v2-distilled
    score: 6
    reasoning: >-
      Love this — and the meta-move of making the tracker itself App #001 is
      genuinely clever; it's the kind of 'ship the scaffolding first' instinct
      that Brian Chesky showed when he manually photographed those first Airbnb
      listings himself. The AI-panel-as-content angle is real differentiation
      and the build-in-public narrative loop is a legitimate distribution wedge.
      That said, I'd want to push hard on one thing: right now this looks like a
      vitamin for builders who like vibes, not a painkiller for a specific
      person with a specific Tuesday-morning problem — the 'panel of investors'
      feature is genuinely fun, but fun isn't pull, and I'd worry the 100-day
      commitment is doing emotional work that product-market fit should be
      doing. The deeper question I'd ask: who is the *second* user — not you,
      not a friend who's cheering — but the person who finds this cold, reads
      one scored idea card, and immediately thinks 'I need to submit my idea
      right now'? If you can name that person and show me three DMs from them
      this week, the score goes to 8 fast; if you can't, this is a beautiful
      content experiment that might not compound into anything default-alive,
      and the kill criteria you've set (20 ideas in 4 weeks) measures *your*
      output velocity, not user pull — which is the wrong metric to be watching.
    generated_at: '2026-05-10T03:56:01.313Z'
    model: claude-sonnet-4-6
  - persona: naval
    mentor_version: v2-distilled
    score: 7
    reasoning: >-
      The founder might observe that the real asset here is not the tracker but
      the compounding narrative itself — each shipped app is a unit of media
      leverage, and media is permissionless; that is the strongest thing about
      this. The AI-persona panel is a clever forcing function: it makes the
      judgment legible, creates genuine overlap-and-disagreement content, and
      embeds a taste layer that a generic team could not replicate without the
      same obsessive research into how these specific minds actually think.
      Where it sits unclear is the long-term game — a hundred apps in a hundred
      days is a sprint, and sprints do not compound; the question is whether the
      pipeline produces one or two things with genuine code leverage underneath,
      or whether the whole journey resolves into a content artifact that stops
      earning the day the founder stops shipping. The specific knowledge is
      real, the media leverage is real, but the founder should ask early: which
      of these hundred bets is the one they would run for ten years.
    generated_at: '2026-05-10T03:55:59.265Z'
    model: claude-sonnet-4-6
  - persona: pg
    mentor_version: v2-distilled
    score: 5
    reasoning: >-
      There's something genuinely interesting here — the idea that the journey
      itself is the product, that app #001 has to exist to host apps #2-100, has
      a nice recursive honesty to it, like Stripe building their first internal
      payments tool. But I'd note that 'build in public with AI-simulated
      investor panels' is a very clean idea, almost suspiciously clean, and as I
      wrote in 'How to Get Startup Ideas', the best ideas usually look bad at
      first, not like a polished content strategy. The real question is whether
      anyone besides the founder wants to read these AI-Paul-Graham scoring
      cards on Tuesday morning — or whether this is a sophisticated way of
      making a very good personal blog that will accumulate exactly the audience
      of people who also want to do 100-app challenges, which is a fine outcome
      but not a startup. The 'users can forge their own mentors' feature is the
      most interesting thread here, because that's where actual schlep hides,
      and if that part works well enough to be genuinely useful to someone else,
      that might be the real product.
    generated_at: '2026-05-10T03:55:59.074Z'
    model: claude-sonnet-4-6
  - persona: jensen-huang
    mentor_version: v2-distilled
    score: 5
    reasoning: >-
      The narrative instinct here is genuinely interesting — Jensen might note
      that turning the journey itself into the content, and the
      panel-of-simulacra as the differentiator, shows real product thinking
      about distribution as a layer of the stack, not an afterthought. But he
      would likely pause and ask the hard question: where in the stack do you
      actually own something? Because right now this is Astro plus markdown plus
      Claude API plus a prompt engineering pattern — and if Anthropic changes a
      pricing tier, or OpenAI ships a 'simulate any investor' feature inside
      ChatGPT, the moat you think you have evaporates overnight. The
      computational problem is fully CPU-shaped — this is content rendering and
      API calls, not a workload that needs heroic compute — and he'd gently
      observe that the persona-forge pipeline, however elegant, is workflow
      orchestration around somebody else's model, which is renting your core
      value from a landlord who does not love you. He might say with a slight
      smile: 'The suffering here is the right kind — one-day ship, kill criteria
      written in advance, that's honest — but the question is whether the 99
      apps that follow compound into something that owns a layer, or whether
      they are 99 experiments that each individually rent their moat, and the
      lesson you learn on Day 100 is that you built a beautiful diary of other
      people's infrastructure.'
    generated_at: '2026-05-10T03:56:01.241Z'
    model: claude-sonnet-4-6
---

# 100 Apps Journey

承载 "100 天做 100 个 app" 实验的公开 idea pipeline。

## 为什么这个 app 是 #001

它必须是第一个，因为：

- 后面 99 个 app 都需要一个能 host them 的地方
- Build-in-public 需要从第一天就有一个公开归宿，不能事后补
- Tracker 自己就是一个 prototype——验证了 "Astro + markdown + Claude API" 一天内能 ship 一个有差异化的产品

## 差异化的核心：panel of investors

6 位真实人物的 AI 模拟分别评分（Karpathy / Musk / Garry Tan / Naval / PG，加上 v2-distilled 的 Steve Jobs——通过本项目内置的 `/persona-forge` skill 经 6-agent 调研 + 三重验证 + 质量 gate 蒸馏出来）。和 archetype 方案不同——他们不分工，每人按自己真实风格综合判断。重叠和分歧本身就是看点。

每张评分卡明确标注 "AI simulation"，footer 加 disclaimer。

## 用户可以加自己的 mentor

`/mentors` 页面有 forge widget——输入名字 → 实时生成可复制的 `/persona-forge "<name>"` 命令。在 Claude Code 里跑约 8-15 分钟，新 mentor 自动进 panel。这是 closed bench by design——加 mentor 是 craft，不是 CRUD。

## Reasoning（自评）

Thesis 里的赌注是：在 2026 年 AI 编程时代，生产效率不再是瓶颈，**叙事和分发**才是。一个工具如果同时是 narrative artifact，复利就高。

今天作为 Day 1 ship，背后有大量并行 agent 工作（plan / 6 reviewer / 6 research agent / 3 validator / frontend skill）。这本身是 100-app 节奏的存在性证明——一个有真实差异化的 app 一天内可以从想法到上线。
