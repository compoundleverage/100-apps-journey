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
      The thesis that narrative and distribution matter more than build velocity
      in an AI-assisted world might be right — but this thing is a wrapper
      wearing a trenchcoat pretending to be a product: it sits on Claude's API,
      on Astro, on markdown, and any one of those platform owners can redecorate
      your living room overnight without asking. The 'panel of investors'
      feature is genuinely the one interesting joint in the cabinet — the
      friction between simulated voices *is* the product — but then they buried
      it under a build-in-public meta-narrative about the journey itself, which
      is the oldest content-creator dodge in the book: make the making the
      thing, so you never have to ship the thing. A bicycle for the mind has to
      make the rider faster; right now this bicycle is mostly a mirror pointed
      at the bicycle. What did they say no to? I can't tell, because the kill
      criteria are calendar rules, not product convictions — and real focus cuts
      features, not weeks.
    generated_at: '2026-05-10T02:57:20.220Z'
    model: claude-sonnet-4-6
  - persona: karpathy
    mentor_version: v1-bootstrap
    score: 6
    reasoning: >-
      There's something genuinely clever here — using the journey itself as the
      content, and making app #001 the container for apps #002-100 is a clean
      recursive move that Karpathy would likely appreciate as 'eating your own
      dogfood from day zero.' The AI panel idea is interesting but he'd probably
      flag that simulating himself and calling it 'v2-distilled Karpathy' is
      doing a lot of work that a few cherry-picked tweets and blog posts can't
      actually support — LLMs pattern-matching on public persona outputs is not
      distillation, it's cosplay, and the gap between the two is where the
      disclaimer lives. The real question he'd ask: is the AI panel generating
      *evaluations you couldn't have written yourself*, or is it a Rube Goldberg
      machine for producing content that feels authoritative but is ultimately
      stochastic agreement with the builder's priors — which, given he's
      literally one of the simulated judges scoring his own inclusion, is a
      conflict of interest that would make him laugh and wince simultaneously.
    generated_at: '2026-05-10T02:57:19.948Z'
    model: claude-sonnet-4-6
  - persona: musk
    mentor_version: v1-bootstrap
    score: 6
    reasoning: >-
      The meta-move of making the tracker itself App #001 is clever — it's
      self-bootstrapping and the narrative compounds with every subsequent ship,
      which is genuinely good physics. The 'panel of simulated investors' is the
      only real hook here and it's moderately interesting, but would probably
      note that simulating him alongside PG and Naval as a *scoring panel* is
      more parlor trick than product — the diff between 'AI says Musk would rate
      this 7/10' and actual insight is large and will collapse on users fast.
      The kill criteria are honest and that earns respect, but 100 apps in 100
      days is a content strategy wearing a product strategy's clothes —
      ambitious cadence, incrementalist ceiling.
    generated_at: '2026-05-10T02:57:19.078Z'
    model: claude-sonnet-4-6
  - persona: garry-tan
    mentor_version: v1-bootstrap
    score: 6
    reasoning: >-
      Garry might say he genuinely loves the meta-narrative move here — 'the
      journey is the content' is a real insight, and shipping Day 1 as
      proof-of-methodology is smart founder energy, not cosplay. But he'd
      probably push hard on who the actual user is beyond the builder
      themselves: right now this reads like a personal creative system dressed
      up as a product, and the 'panel of investors' mechanic, while delightful,
      risks being a novelty that people screenshot once and never return to —
      he'd want to see retention signal or a reason the 10th visit is as
      valuable as the first. The wedge question he'd ask is sharp: 'Are you
      building an audience product, a tool product, or a content product?
      Because the answer changes everything about what you should optimize in
      week two.'
    generated_at: '2026-05-10T02:57:20.315Z'
    model: claude-sonnet-4-6
  - persona: naval
    mentor_version: v1-bootstrap
    score: 7
    reasoning: >-
      Naval might observe that the meta-move here is genuinely clever — the
      journey *is* the product, the content *is* the distribution, and shipping
      a tracker as app #001 is the kind of recursive self-validation that
      separates people who think about building from people who actually build.
      He would likely note, however, that simulating six oracles is still a form
      of borrowed specific knowledge, and the real question is whether the
      *forge* mechanism — the 8-15 minute distillation ritual — becomes a
      permissionless leverage primitive that others can compound on, or whether
      it stays a narrative flourish on someone else's 100-day clock. The kill
      criteria are honest, which he respects; intellectual honesty about when to
      quit is rarer than the ambition to start.
    generated_at: '2026-05-10T02:57:18.614Z'
    model: claude-sonnet-4-6
  - persona: pg
    mentor_version: v1-bootstrap
    score: 4
    reasoning: >-
      The founder might be onto something real — build-in-public has genuine
      narrative pull, and the investor-panel framing is more interesting than a
      plain idea tracker — but this reads like someone who's more excited about
      the architecture (6-agent research, triple validation, persona-forge) than
      about whether anyone outside their own head actually wants to watch this
      unfold. The schlep here isn't the tooling, it's the 99 apps that have to
      actually be good, and nothing in the pitch addresses that; it's all
      meta-infrastructure for a journey that hasn't proven it has legs. When a
      Day 1 app is a tracker for the other apps you're going to build, you're
      either doing something clever or you're procrastinating with extra steps —
      and the density of jargon here makes me suspect the latter.
    generated_at: '2026-05-10T02:57:19.235Z'
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
