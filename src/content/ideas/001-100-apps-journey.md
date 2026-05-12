---
id: 1
title: 100 Apps Journey
status: shipped
date_added: 2026-05-10T00:00:00.000Z
date_started: 2026-05-10T00:00:00.000Z
date_shipped: 2026-05-10T00:00:00.000Z
thesis: >-
  做一个 idea tracker 没差异化；做一个公开的 100 天 build-in-public
  日志，把 angel investor
  的评判落到产品里——AI 模拟的真人投资人逐个评分，访客可以直接和顾问团对话（Clarify / 单聊 /
  圆桌讨论）——叙事张力和工具价值就能合一。Journey 本身就是 content。
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
    score: 5
    reasoning: >-
      You shipped on day one and the recursive structure — app one hosts apps
      two through a hundred — is genuinely elegant, the kind of thing that takes
      thirty seconds to explain and stays with you. But here's what bothers me:
      you're building a cabinet where Anthropic controls the wood and the saw,
      and the moment their API pricing or content policy shifts, your most
      differentiated feature — that panel — just disappears. And the deeper
      problem is the bicycle test: when someone reads six AI simulations of how
      Karpathy or Naval would score their idea, do they actually think harder,
      or do they just feel validated by a very expensive mirror? The real
      product might live in the discomfort between conflicting scores, but right
      now I'm not sure you've found it yet.
    dimensions:
      - name: Integration vs wrapper
        verdict: fail
        note: >-
          Claude API and Astro both controlled by third parties; one policy
          change kills the panel
      - name: Subtraction discipline
        verdict: unclear
        note: 'Six mentors, forge widget, build log — unclear what the ONE job is'
      - name: Talent density
        verdict: pass
        note: 'Shipped day one, solo, with real orchestration depth; that''s craft'
      - name: Cannibalize-yourself courage
        verdict: pass
        note: 'App #001 exists to make #002–100 harder to abandon; real stakes'
      - name: Hidden quality
        verdict: unclear
        note: >-
          Disclaimer on cards is honest; but error states under API failure
          unknown
      - name: Bicycle-for-the-mind test
        verdict: fail
        note: >-
          Simulated judgment may replace the builder's own reckoning, not
          sharpen it
    generated_at: '2026-05-10T22:50:54.261Z'
    model: claude-sonnet-4-6
  - persona: karpathy
    mentor_version: v2-distilled
    score: 5
    reasoning: >-
      The narrative-as-product framing is actually the most interesting thing
      here — you're not building a tracker, you're building a compounding
      artifact where the journey is the content, and I think that's a real
      insight about distribution in the Software 3.0 era. But the persona panel
      is where I'd push hard: right now 'divergence between simulated Karpathy
      and simulated Naval is the feature' is a vibe, not a design — what's your
      eval for when simulated-me says something I'd find embarrassing or flatly
      wrong? (btw, I'm in the panel, so I have a personal stake in asking :))
      The march-of-nines problem here isn't uptime, it's persona fidelity over
      100 apps — each additional idea card is another surface where a simulated
      legend can hallucinate a position they'd never hold, and without a
      verification loop that compounds into slop. Ship the /persona-forge
      internals as a readable artifact — even 200 lines of prompt + agent wiring
      posted publicly — and you'd go from 'trust me it works' to something
      people can actually learn from and audit.
    dimensions:
      - name: Software 2.0/3.0 fluency
        verdict: pass
        note: 'Prompts and agent topology are the product, not the UI chrome'
      - name: First-principles understanding
        verdict: unclear
        note: Persona-forge pipeline described narratively; internals opaque to me
      - name: Eval-driven discipline
        verdict: fail
        note: No eval set; 'divergence is the point' is vibes dressed as methodology
      - name: Reliability calibration (march of nines)
        verdict: unclear
        note: >-
          Kill criteria exist but don't address persona fidelity degradation
          over time
      - name: Educational compounding
        verdict: pass
        note: >-
          Mentor-forge widget teaches craft, not just consumption;
          closed-by-design is honest
      - name: Jagged intelligence awareness
        verdict: fail
        note: >-
          Six simulated legends with no stated failure modes or verification
          loops
    generated_at: '2026-05-10T22:50:55.871Z'
    model: claude-sonnet-4-6
  - persona: musk
    mentor_version: v2-distilled
    score: 3
    reasoning: >-
      You've built a scoreboard for your own scoreboard — that's roughly 0% of
      the way to something that matters. The 1-day ship cadence is the only
      thing here I'd call a genuine signal; wartime tempo is real and rare, I'll
      give you that. But wrapping an idea tracker in six AI simulations and
      calling the recursion a 'narrative artifact' doesn't change the underlying
      idiot index — you're burning Claude API tokens to generate investor
      cosplay on top of markdown files, which is at least 10x more process than
      the problem requires. Most likely outcome: 100 apps of incrementally
      higher craft, zero of civilizational consequence — which might be fine for
      personal development, but don't mistake the content flywheel for the
      mission.
    dimensions:
      - name: Ambition floor (10x or 10%?)
        verdict: fail
        note: 'An idea tracker with ratings is a feature, not a civilizational bet.'
      - name: First-principles vs analogy
        verdict: unclear
        note: >-
          No cost estimate; 'Astro + markdown + Claude API' is still
          analogy-stack.
      - name: Inherited-assumption audit
        verdict: fail
        note: >-
          Assumes 'build-in-public' narrative creates compounding value —
          unproven.
      - name: Wartime tempo signal
        verdict: pass
        note: 1-day ship cadence with kill criteria is credible wartime discipline.
      - name: Subtraction discipline
        verdict: fail
        note: >-
          6 agents, 3 validators, persona-forge widget — this is addition, not
          deletion.
      - name: Civilizational stake
        verdict: fail
        note: >-
          Nothing here touches energy, intelligence, transport, or existential
          risk.
    generated_at: '2026-05-10T22:50:57.007Z'
    model: claude-sonnet-4-6
  - persona: garry-tan
    mentor_version: v2-distilled
    score: 5
    reasoning: >-
      Love the discipline here — shipping #001 as the container for everything
      else is a beautiful recursive move, and the kill criteria tell me you're
      not cosplaying a founder, you're actually doing the work. But I'd want to
      push on this hard: right now the AI-simulated investor panel feels more
      like a content hook than a painkiller — it's the kind of thing builders
      say 'that's clever' about on a Tuesday and then don't open again on
      Wednesday, which is the vitamin trap Gobble and a hundred other
      'delightful tools' fell into before finding the one job someone would
      actually pay to get done. The real question I'd be asking you every week
      is: who specifically is paying you, even $5, to keep their idea pipeline
      in this system rather than a Notion doc — because the day you find that
      person and trace it back to a specific quote from a real conversation,
      THEN you have a wedge, and the narrative flywheel you're betting on
      actually has somewhere to land.
    dimensions:
      - name: Wedge to first 100 users
        verdict: unclear
        note: Builder-audience fits; paying path and ICP sharpness still missing
      - name: Painkiller vs vitamin
        verdict: fail
        note: 'Panel-of-simulacra is delightful content, not workflow pain relief'
      - name: Manic listening signal
        verdict: fail
        note: 'No user quotes cited; thesis driven by founder narrative, not pull'
      - name: Earnest formidable founder
        verdict: pass
        note: Day-1 ship discipline and kill criteria show real earnestness
      - name: Default alive / ramen profitable
        verdict: unclear
        note: No monetization path visible; content flywheel ≠ revenue flywheel yet
      - name: AI-native shape
        verdict: pass
        note: >-
          Multi-agent persona-forge pipeline is genuinely novel architectural
          thinking
      - name: Why now
        verdict: pass
        note: >-
          Vibe-coding era makes 1-day ships credible; narrative-as-product is
          timely
      - name: Day-1 founder / high agency
        verdict: pass
        note: Shipped v1 in one day; kill criteria set upfront — that's the posture
    generated_at: '2026-05-10T22:50:55.309Z'
    model: claude-sonnet-4-6
  - persona: naval
    mentor_version: v2-distilled
    score: 6
    reasoning: >-
      You've found something real here: the journey is the content, and code
      plus media leverage fused is genuinely rare. The honest tension is that
      the 100-app pace is still trading your time for output — the compounding
      lives in the archive and the audience, not in the apps themselves, and
      that only materializes if you stay consistent long enough for the
      narrative to develop gravity. The persona-forge moat is clever but thin;
      once someone sees the pattern, they replicate it in a weekend. The actual
      specific knowledge you're building — what it feels like to ship a
      differentiated product in a day, iterated a hundred times — that's the
      asset no one can copy, because it lives in you.
    dimensions:
      - name: Leverage type and amount
        verdict: pass
        note: Code plus media fused; content compounds without continuous input
      - name: Specific knowledge
        verdict: unclear
        note: 'Persona-forge craft is real, but copyable once the pattern is visible'
      - name: Long-term vs short-term game
        verdict: pass
        note: >-
          100-iteration commitment signals long game; compounding narrative is
          the bet
      - name: Permissionless or gatekept
        verdict: pass
        note: Astro plus markdown plus Claude API; no gatekeeper owns the rail
      - name: Compounding while you sleep
        verdict: unclear
        note: Archive compounds; but daily shipping still rents your time heavily
    generated_at: '2026-05-10T22:50:53.649Z'
    model: claude-sonnet-4-6
  - persona: pg
    mentor_version: v2-distilled
    score: 4
    reasoning: >-
      You've done the thing I most respect — you shipped on day one, which
      already separates you from 90% of people who pitch me ideas — but I'd push
      back on whether this is a startup or a newsletter with extra steps. The
      real bet here isn't the tool, it's you: if the 100-app journey produces
      two or three genuinely interesting products that people use, the tracker
      becomes a footnote and one of those apps becomes the actual thing. As I
      wrote in 'How to Get Startup Ideas', the best ideas come from living in
      the future and noticing what's missing — right now this feels more like a
      content scaffold than a product with organic pull, and the AI-simulated
      panel is a party trick until someone other than you uses it to make a real
      decision on a real Tuesday morning.
    dimensions:
      - name: Make-something-people-want signal
        verdict: unclear
        note: 'Audience is builders watching you, not repeat tool users yet'
      - name: Schlep blindness opportunity
        verdict: fail
        note: Persona-forge is clever but schlep here is just prompt engineering
      - name: Default Alive or Default Dead
        verdict: unclear
        note: >-
          No monetization visible; content play survival depends on compounding
          attention
      - name: Live-in-the-future signal
        verdict: pass
        note: You are clearly the user; Day 1 ship proves real conviction
      - name: Founder Mode vs Manager Mode applicability
        verdict: pass
        note: 'Solo builder, every decision still propagates through one brain'
    generated_at: '2026-05-10T22:50:52.686Z'
    model: claude-sonnet-4-6
  - persona: jensen-huang
    mentor_version: v2-distilled
    score: 4
    reasoning: >-
      The one thing I would say you got genuinely right is the tempo — shipping
      something with real differentiation in one day using parallel agents is
      exactly the kind of cycle-time signal that matters, and I mean that
      sincerely. But you asked Earth's most important computer to host a
      Markdown idea tracker, and when I pull on the stack, you own almost
      nothing: Anthropic changes a pricing tier, the panel disappears; Astro
      ships a breaking release, the site goes down; and the 'differentiation' —
      six AI simulations of famous people evaluating your own ideas in public —
      that is a content strategy, not a product moat, and a content strategy
      that depends entirely on you personally shipping 99 more things. The
      suffering hasn't arrived yet, and I say this with great warmth — when Day
      47 comes and the ideas are thin and the audience has moved on and Claude's
      API bill is real, that is when you will learn whether this was a journey
      or a performance; I cannot score the journey until the forge has been
      tested by fire.
    dimensions:
      - name: Accelerated-computing applicability
        verdict: fail
        note: CRUD pipeline with Claude API call; no parallel compute problem here
      - name: Stack integration
        verdict: fail
        note: Astro + markdown + Claude API; renting all three load-bearing layers
      - name: Cycle time
        verdict: pass
        note: >-
          One-day ship with multi-agent parallel build is genuinely impressive
          tempo
      - name: Suffering signal
        verdict: unclear
        note: Day 1 is too early; the forge hasn't been tested by heat yet
      - name: Sovereign-scale ambition
        verdict: fail
        note: 'A public build log is a blog with scoring cards, not infrastructure'
    generated_at: '2026-05-10T22:50:54.929Z'
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

每个 idea 由顾问团（一组 AI 模拟的真人投资人）分别评分。每位通过本项目内置的 `/persona-forge` skill 经 6-agent 调研 + 三重验证 + 质量 gate 蒸馏出来。和 archetype 方案不同——他们不分工，每人按自己真实风格综合判断。重叠和分歧本身就是看点。

页面顶部有当前顾问团的实时统计（人数、版本分布）；mentors 收录在 `src/content/mentors/` 下，扩张时这里的数字自动跟新。

## 不只是评分，能直接对话

后续迭代加了三种交互模式：

- **Clarify**：mentor 打完分后，可以让 Ta 反过来问 1-3 个尖锐问题，回答后重新评分。
- **单聊（1-on-1）**：和某位 mentor 私下展开对话，他/她会用自己的 mental model 押你。
- **圆桌（Group）**：所有 mentor 同时入场。先各说一句，后续由"谁不同意谁接话"的 orchestrator 决定下一个发言人。

对话功能 BYOK——访客填自己的 Anthropic API key，本站不替访客出 API 钱。Key 仅存浏览器 localStorage，本服务器不记日志。

## 用户可以加自己的 mentor

`/mentors` 页面有 forge widget——输入名字 → 实时生成可复制的 `/persona-forge "<name>"` 命令。在 Claude Code 里跑约 8-15 分钟，新 mentor 自动进 panel。这是 closed bench by design——加 mentor 是 craft，不是 CRUD。

## Reasoning（自评）

Thesis 里的赌注是：在 2026 年 AI 编程时代，生产效率不再是瓶颈，**叙事和分发**才是。一个工具如果同时是 narrative artifact，复利就高。

Day 1 ship 当晚，背后是大量并行 agent 工作（plan / 6 reviewer / 6 research agent / 3 validator / frontend skill）。这本身是 100-app 节奏的存在性证明——一个有真实差异化的 app 一天内可以从想法到上线。

后续 Day N 的迭代（i18n / 评分 workflow / OG image / 三种 chat 模式 / SSR 切换）都按"问题 → plan → 实施 → push"节奏来；本页 thesis 写得 evergreen，具体数字交给下面的 Live State 自动更新。
