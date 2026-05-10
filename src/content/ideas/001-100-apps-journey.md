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
      我看了你的整个 setup，问题不在执行力——一天 ship
      出来，这我承认。问题在你把元层（tracker）当成产品本身来卖，这是个陷阱：你造了一个放自行车的车库，然后告诉我车库就是那辆自行车。真正的问题是：你的
      panel of investors 里有个'v2-distilled 的 Steve Jobs'——你有没有想过，一个把名人人格蒸馏进
      prompt
      然后批量签发评分卡的机器，和你在街头卖假签名海报的人，区别在哪里？差异化不在于角色数量，在于判断的真实重量。你告诉我你杀掉了什么？kill
      criteria 写的是节奏撑不住就撤——那只是 schedule 风险，不是 product discipline。你有没有问过自己：如果把
      panel 砍到一个人，这个产品还剩什么？如果答案是'没什么'，你就知道内核空在哪里。
    generated_at: '2026-05-10T21:13:24.894Z'
    model: claude-sonnet-4-6
  - persona: karpathy
    mentor_version: v2-distilled
    score: 4
    reasoning: >-
      我看了你这个 idea，坦白说，核心问题不是叙事，是 eval——你模拟了我，但你有没有一套 ground-truth
      测试集来验证这个模拟是否在说有意义的话，还是在产出听起来像 Karpathy 但实际上是 vibes 的 slop？这是我第一个会问的问题，而你的
      thesis 完全跳过了它。你把 'AI simulation 明确标注'
      当成免责牌，但这不够——一个糟糕的模拟比没有模拟更有害，因为它给错误的信心加了名人背书的包装，这是比 hallucination
      更危险的东西。差异化的赌注我理解，'工具即内容' 这个框架我也觉得有意思，但你描述的 6-agent pipeline、三重验证、quality
      gate 这些词听起来很系统，却完全没有告诉我一个具体的 prompt → output → 评估 loop
      长什么样——如果你给我看一张真实的评分卡、一个失败案例、以及你怎么知道它失败了，分数会高很多；现在这个 proposal 本质上是在说 '我
      ship 了一个 build-in-public tracker，里面有 AI 模拟名人'，这距离 '有真实差异化的产品' 还差一个
      evals-first 的重构。
    generated_at: '2026-05-10T21:13:27.446Z'
    model: claude-sonnet-4-6
  - persona: musk
    mentor_version: v2-distilled
    score: 4
    reasoning: >-
      我看了，第一个问题：这东西的 raw material cost 是什么？Claude API token 加 Astro
      模板，边际成本接近零，但你的 idiot index 不在钱上——在注意力上。你花了一天建了一个记录你要建什么的工具，这是经典的 meta-work
      陷阱，Ryan Holiday 叫它 'feel like progress without making progress'。第二个问题：你 AI
      模拟的这六个人，包括我，每一个都只有 prompt 背后的概率分布——没有任何新信息被生成，只有已有信息被重排，用户第 3
      次看完评分卡就会意识到这个，留存曲线会在那里断掉。你的 kill criteria
      写得不错，但它测的是你的执行纪律，不是这个产品是否值得存在——这两件事不一样。真正的问题是：如果 100 个 app
      里有一个能改变某件重要的事，那个 app 是什么，为什么你不从那里开始？
    generated_at: '2026-05-10T21:13:25.238Z'
    model: claude-sonnet-4-6
  - persona: garry-tan
    mentor_version: v2-distilled
    score: 4
    reasoning: >-
      我看了你这个 idea，有一句话想直接说：你把「分发即产品」这个洞察讲得很清楚，build-in-public +
      panel-of-AI-judges 的叙事结构有真实的拉力——但这是一个维生素，不是止痛药。你告诉我的第一个用户是谁？不是「有 100 app
      野心的 builder」这种 archetype，是一个具体的人，他今天早上 9 点在做什么、在哪里痛到会立刻打开你的 app
      付钱？我会担心的核心问题是：你模拟了 Garry Tan / PG / Jobs，但模拟质量的天花板是 persona-forge
      的评研深度，而那个深度今天还不存在——evals 没有，ground truth 没有，你怎么知道「Karpathy 给 4 分」和「Jobs 给
      7 分」的分歧是洞见而不是幻觉？最后一个真正锋利的问题留给你想清楚：Journey 本身是 content 这件事没错，但 content
      的复利靠的是受众增长，而不是 app 数量增长——你的 kill criteria 量的是 ideas
      列表，量的不是「有多少人每周回来看你的下一张评分卡」，你把对的东西当 kill criteria 了吗？
    generated_at: '2026-05-10T21:13:27.327Z'
    model: claude-sonnet-4-6
  - persona: naval
    mentor_version: v2-distilled
    score: 6
    reasoning: >-
      我看了你这个 idea——叙事本能是对的，Journey 即 content 这个直觉我认同，分发和故事才是 2025
      年真正的稀缺。但我会担心一件事：你把大量精力花在 panel
      的仿真保真度上，却没有回答一个更根本的问题——这个资产在你不在的时候会自己生长吗？Build-in-public 的复利来自受众的积累，不来自
      app 本身的精巧；如果 100 天之后你停更，这个东西剩下什么？你的 kill criteria 写得很工程师——以条数和天数为标准——但真正的
      kill criteria 应该是：第 30 天有没有人因为看了你的 panel
      评分而改变了自己的决策。工具加叙事的组合是对的，但叙事必须真的在外面流动，不能只活在你自己的 pipeline 里。
    generated_at: '2026-05-10T21:13:24.201Z'
    model: claude-sonnet-4-6
  - persona: pg
    mentor_version: v2-distilled
    score: 4
    reasoning: >-
      我看了你这个 idea，最大的问题不是执行力——你一天 ship
      出来了，这是真的——而是你的差异化核心本质上是内容产品，不是工具产品，但你在用工具产品的框架来想它。AI 模拟 PG、Musk、Karpathy
      评分这件事，第一次看有意思，第三次就是装饰，因为用户没有理由回来——他们 ideas 有限，panel 是固定的，novelty
      消耗完就没了；你想清楚了吗：你的 kill criteria 是'20个 ideas'，但真正的死亡信号应该是'有没有人在用这个 tracker
      而不是你自己'？Build-in-public 的叙事张力是真实的，但那是你作为 builder 的
      audience，不是产品的用户，这两件事混在一起会让你误判 traction。
    generated_at: '2026-05-10T21:13:24.086Z'
    model: claude-sonnet-4-6
  - persona: jensen-huang
    mentor_version: v2-distilled
    score: 3
    reasoning: >-
      我看了这个 idea，说实话，你把 meta 叙事和工具价值「合一」这件事——我理解那个冲动，但你解决的根本不是一个 GPU
      问题，甚至不是一个真实的工程问题，你在解决的是「我怎么让自己显得在做事」的问题。你拥有的栈是什么？Astro 加 markdown 加 Claude
      API——这三层你一层都不拥有，你在租别人的地基盖自己的展示柜，一次 API 定价调整就能让你的「差异化」消失。我最担心的是：你把
      build-in-public 的叙事张力当成了护城河——那不是护城河，那是营销；真正的护城河是你在 persona distillation
      这个方向上能不能做出别人复制不了的东西，而不是把 6 个名字摆进 panel 就叫「蒸馏」。你想清楚了吗——这 100
      天结束之后，你手里会有什么是属于你的？
    generated_at: '2026-05-10T21:13:24.808Z'
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
