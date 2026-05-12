/**
 * Lightweight query-string i18n. Default is Chinese; `?lang=en` switches.
 *
 * Mentor reasoning is canonical English (per VOICE_OVERRIDE in scripts/evaluate.ts);
 * this layer only swaps UI chrome. Idea body markdown stays in its source language.
 *
 * Persistence is handled by an inline script in Layout.astro that writes the
 * preference to localStorage and redirects when the URL doesn't carry the param.
 */

export type Lang = "zh" | "en";

export const DEFAULT_LANG: Lang = "zh";

export function getLang(url: URL): Lang {
  const q = url.searchParams.get("lang");
  if (q === "en" || q === "zh") return q;
  return DEFAULT_LANG;
}

/**
 * Add `?lang=en` only when needed. Default lang gets a clean URL.
 * Preserves any other existing query params.
 */
export function localizedHref(path: string, lang: Lang): string {
  if (lang === DEFAULT_LANG) return path;
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}lang=${lang}`;
}

type Strings = {
  // <html lang> + <meta description>
  htmlLang: string;
  site_description: string;

  // Header/nav
  masthead_volume: string;
  nav_pipeline: string;
  nav_standings: string;
  nav_bench: string;
  nav_method: string;
  lang_toggle_to: string; // text shown on the toggle (the OTHER lang's label)

  // Footer
  footer_section_index: string;
  footer_section_about_panel: string;
  footer_section_typography: string;
  footer_disclaimer: string;
  footer_typography_label: string;

  // Home page
  home_section_label: string;
  home_headline_l1: string;
  home_headline_l2: string;
  home_headline_l3: string;
  home_intro: string;
  home_as_of: (date: string) => string;
  home_stats_recorded: string;
  home_stats_idea: string;
  home_stats_building: string;
  home_stats_shipped: string;
  home_stats_killed: string;
  home_empty_title: string;
  home_empty_subtitle: string;

  // Stats page
  stats_page_title: string;
  stats_section_label: string;
  stats_headline_l1: string;
  stats_headline_l2: string;
  stats_empty_l1: string;
  stats_empty_l2: string;
  stats_block_pipeline_title: string;
  stats_block_pipeline_desc: (total: number) => string;
  stats_block_panel_avg_title: string;
  stats_block_panel_avg_desc: string;
  stats_block_panel_avg_count: (n: number) => string;
  stats_block_distribution_title: string;
  stats_block_distribution_desc: (n: number) => string;
  stats_block_top_title: string;
  stats_block_top_desc: string;
  stats_block_top_empty: string;
  stats_block_divisive_title: string;
  stats_block_divisive_desc: string;
  stats_block_divisive_empty: string;

  // About page
  about_page_title: string;
  about_section_label: string;
  about_headline: string; // used as raw HTML, can include <br>
  about_section_premise: string;
  about_premise_p1: string;
  about_premise_p2: string;
  about_section_framework: string;
  about_framework_intro: string;
  about_framework_thesis: string;
  about_framework_kill: string;
  about_framework_budget: string;
  about_framework_tags: string;
  about_section_panel: string;
  about_panel_p1: string;
  about_panel_disclaimer_p1: string;
  about_panel_disclaimer_p2: string;
  about_section_pact: string;
  about_pact_p1: string;
  about_pact_p2: string;
  about_back_to_pipeline: string;

  // Ideas detail page
  idea_entry_label: (id: string) => string;
  idea_recorded: string;
  idea_budget: string;
  idea_shipped_at: string;
  idea_killed_at: string;
  idea_stealth_inline: string;
  idea_panel_avg: string;
  idea_panel_avg_count: (n: number) => string;
  idea_panel_section: string;
  idea_panel_pending: string;
  idea_sealed_title: string;
  idea_sealed_p1: string;
  idea_sealed_p2: string;
  idea_body_section: string;
  idea_link_url: string;
  idea_link_repo: string;
  idea_back_to_pipeline: string;
  idea_footer: (id: string) => string;
  idea_stealth_description: (id: string) => string;

  // Idea card
  card_stealth_label: string;
  card_stealth_title: string;
  card_thesis_hidden: string;
  card_recorded_at: (date: string) => string;
  card_budget: (budget: string) => string;
  card_avg_label: string;
  card_avg_pending: string;
  card_sealed: string;
  card_sealed_title: string;

  // Status badge
  status_idea: string;
  status_building: string;
  status_shipped: string;
  status_killed: string;

  // Investor panel
  panel_header_count: (n: number) => string;
  panel_header_subtitle: string;
  panel_distilled: string;
  panel_bootstrap: string;
  panel_stale: string;
  panel_stale_title: (was: string, now: string) => string;
  panel_pending: string;
  panel_seat_open: string;
  panel_seat_open_subtitle: string;
  panel_invite_prefix: string;
  panel_disclaimer_p1: string;
  panel_disclaimer_p2: string;

  // Loading panel (dev preview)
  loading_default_title: string;
  loading_state_queued: string;
  loading_state_reading: string;
  loading_state_consulting: string;
  loading_state_composing: string;
  loading_state_signed: string;
  loading_state_failed: string;
  loading_summary_done: (total: number) => string;
  loading_summary_progress: (signed: number, total: number, failed: number) => string;
  loading_failed_msg: (name: string) => string;
  loading_retry: string;
  loading_disclaimer: string;
  loading_avg_title: (n: number) => string;
  loading_avg_label: string;
  loading_in_progress: (n: number) => string;

  // Mentors index page
  bench_page_title: string;
  bench_section_label: string;
  bench_headline_l1: string;
  bench_headline_l2: string;
  bench_intro: string;
  bench_empty_title: string;
  bench_empty_subtitle: string;
  bench_count_seated: (n: number) => string;
  bench_count_distilled: (n: number) => string;
  bench_count_bootstrap: (n: number) => string;
  bench_card_models: string;
  bench_card_heuristics: string;
  bench_card_sources: string;
  bench_card_distilled: string;
  bench_card_bootstrap: string;
  bench_distill_section: string;
  bench_distill_intro: string;
  bench_distill_explainer: string;
  bench_distill_name_label: string;
  bench_distill_paste_label: string;
  bench_distill_copy: string;
  bench_distill_copied: string;
  bench_distill_prereq_title: string;
  bench_distill_prereq_node: string;
  bench_distill_prereq_cc: string;
  bench_distill_prereq_env: string;
  bench_distill_cost_title: string;
  bench_distill_cost_api: string;
  bench_distill_cost_time: string;
  bench_distill_cost_review: string;
  bench_distill_pipeline_p1: string;
  bench_distill_pipeline_p2: string;

  // Mentor detail page
  mentor_page_title_suffix: string;
  mentor_advisor_label: string;
  mentor_v1_callout_p1: string;
  mentor_v1_callout_p2: string;
  mentor_voiceprint_section: string;
  mentor_models_section: string;
  mentor_models_intro: string;
  mentor_expand: string;
  mentor_collapse: string;
  mentor_evidence: string;
  mentor_application: string;
  mentor_limits: string;
  mentor_heuristics_section: string;
  mentor_heuristics_intro: string;
  mentor_when: string;
  mentor_example: string;
  mentor_dna_section: string;
  mentor_dna_sentence: string;
  mentor_dna_vocab: string;
  mentor_dna_rhythm: string;
  mentor_dna_humor: string;
  mentor_dna_certainty: string;
  mentor_dna_citations: string;
  mentor_values_section: string;
  mentor_antipatterns_section: string;
  mentor_tensions_section: string;
  mentor_boundaries_section: string;
  mentor_boundaries_intro: string;
  mentor_lineage_section: string;
  mentor_primary_section: string;
  mentor_primary_empty: string;
  mentor_secondary_section: string;
  mentor_secondary_empty: string;
  mentor_back_to_bench: string;
  mentor_version_complete: string;
  mentor_version_draft: string;
  mentor_version_short_complete: string;
  mentor_version_short_draft: string;
  mentor_research_date: (label: string, date: string) => string;

  // Preview page (dev only)
  preview_page_title: string;
  preview_dev_only_msg: string;
  preview_dev_only_explainer_p1: string;
  preview_dev_only_explainer_p2: string;
  preview_back_to_pipeline: string;

  // Settings page (BYOK)
  settings_page_title: string;
  settings_section_label: string;
  settings_headline: string;
  settings_intro_p1: string;
  settings_intro_p2: string;
  settings_key_label: string;
  settings_key_placeholder: string;
  settings_key_help: string;
  settings_btn_test: string;
  settings_btn_save: string;
  settings_btn_clear: string;
  settings_status_testing: string;
  settings_status_ok: string;
  settings_status_invalid: (msg: string) => string;
  settings_status_saved: string;
  settings_status_cleared: string;
  settings_status_present: string;
  settings_get_key_link: string;
  settings_privacy_title: string;
  settings_privacy_p1: string;
  settings_privacy_p2: string;
  nav_settings: string;

  // Inline API key modal (when chat attempted without key)
  keymodal_title: string;
  keymodal_p1: string;
  keymodal_p2: string;
  keymodal_open_settings: string;
  keymodal_dismiss: string;

  // Chat drawer / thread (1-on-1 + group)
  chat_open_with: (mentorName: string) => string;
  chat_open_panel: string;
  chat_close: string;
  chat_drawer_subtitle_1on1: (mentorName: string) => string;
  chat_drawer_subtitle_group: string;
  chat_composer_placeholder: string;
  chat_send: string;
  chat_thinking: string;
  chat_error_prefix: string;
  chat_cap_reached: (n: number) => string;
  chat_cost_hint: string;
  chat_clear_history: string;
  chat_clear_confirm: string;
  chat_empty_1on1: (mentorName: string) => string;
  chat_empty_group: string;
  chat_role_you: string;

  // Refined evaluation card (rendered after rescore-from-chat)
  clarify_refined_label: string;
  clarify_original_label: string;
  clarify_score_diff: (delta: number) => string;

  // Rescore-from-chat (button inside ChatDrawer)
  rescore_btn: string;
  rescore_btn_disabled_hint: string;
  rescore_loading: string;
  rescore_done: (delta: number) => string;
  rescore_failed: (msg: string) => string;

  // Group orchestrator UX
  group_speaker_label: (mentorName: string) => string;
  group_pass_msg: string;
  group_mention_hint: string;
};

const zh: Strings = {
  htmlLang: "zh-CN",
  site_description:
    "公开的 100 天小实验日志，每个 idea 都由 AI 模拟的真人投资人评分。",

  masthead_volume: "Vol. I · MMXXVI",
  nav_pipeline: "实验池",
  nav_standings: "评分",
  nav_bench: "顾问团",
  nav_method: "方法",
  lang_toggle_to: "EN",

  footer_section_index: "目录",
  footer_section_about_panel: "关于评审",
  footer_section_typography: "排版",
  footer_disclaimer:
    "本站投资人评分均由 AI 模拟生成，依据是他们公开的写作、谈话和思考方式，不代表本人的真实立场或表态。",
  footer_typography_label: "排版 · Fraunces · Spectral · Noto Serif SC · JetBrains Mono",

  home_section_label: "实验池 · 第 001 期",
  home_headline_l1: "100 次尝试。",
  home_headline_l2: "100 天。",
  home_headline_l3: "一份 portfolio。",
  home_intro:
    "公开的小实验日志——每个 idea 由 AI 模拟的几位真人投资人评分。偏好鲜明，分歧更鲜明。",
  home_as_of: (date) => `截至 ${date}`,
  home_stats_recorded: "已记录",
  home_stats_idea: "想法",
  home_stats_building: "在做",
  home_stats_shipped: "已上线",
  home_stats_killed: "已撤",
  home_empty_title: "还没有 idea。",
  home_empty_subtitle: "旅程从第一篇日志开始。",

  stats_page_title: "评分 · 100 Apps Journey",
  stats_section_label: "评分",
  stats_headline_l1: "评审团",
  stats_headline_l2: "的整体倾向。",
  stats_empty_l1: "暂无登记。",
  stats_empty_l2: "随着条目积累，趋势会逐渐显形。",
  stats_block_pipeline_title: "实验池构成",
  stats_block_pipeline_desc: (total) =>
    `目前 ${total} 个登记 idea 的分布。曲线形状告诉你管线健不健康——想法太多是麻痹；已撤太少是恋旧。`,
  stats_block_panel_avg_title: "评审均分",
  stats_block_panel_avg_desc:
    "每位评审在全部 idea 上的均分。离群点比绝对值更重要——谁始终更狠、谁是啦啦队、分歧在哪。",
  stats_block_panel_avg_count: (n) => `${n} 次评分`,
  stats_block_distribution_title: "分数分布",
  stats_block_distribution_desc: (n) =>
    `${n} 次单独评分的聚类形态。双峰说明立场鲜明，扎堆中位说明评审在客气。`,
  stats_block_top_title: "评分榜首",
  stats_block_top_desc: "评审均分最高的几个。",
  stats_block_top_empty: "还没有评过的条目。",
  stats_block_divisive_title: "分歧最大",
  stats_block_divisive_desc: "最高分与最低分的差距最大。",
  stats_block_divisive_empty: "至少需要两次评分才能看出分歧。",

  about_page_title: "方法论 · 100 Apps Journey",
  about_section_label: "方法论",
  about_headline: "为什么 100 天<br />做 100 个 app。",
  about_section_premise: "前提",
  about_premise_p1:
    "AI 把做一个能跑的 prototype 的成本，从几周压缩到了几小时。约束已经不再是工程能力——而是<em>知道做什么</em>。找出答案最有效的方式，就是做、上线、观察、决策。",
  about_premise_p2:
    "这个站点就是这种实验的公开账本：100 天里做 100 次小尝试。每次都按 angel investment 的方式处理——一个 thesis、一个 kill criteria、一份时间预算。大多数会失败，少数会露出苗头。组合思维的前提是：你不会预先知道哪一个是 outlier，只有靠尝试找出来。",
  about_section_framework: "框架",
  about_framework_intro: "每个条目都有四个必填字段，作为约束：",
  about_framework_thesis:
    "<strong>Thesis</strong>——为什么这件事可能有价值，一两句话说清楚。",
  about_framework_kill:
    "<strong>Kill criteria</strong>——什么条件下这件事被无情撤掉。",
  about_framework_budget: "<strong>时间预算</strong>——重新评估之前的投入上限。",
  about_framework_tags: "<strong>标签</strong>——日后做规律识别时的领域标记。",
  about_section_panel: "评审团",
  about_panel_p1:
    "每个 idea 都由一组 AI 模拟的真人投资人和建造者评分。每位都以自己的口吻推理——依据是他们公开的写作、谈话、社媒发言——不做人为的分工。他们的视角会重叠、会分歧、各自带上完整的判断框架。",
  about_panel_disclaimer_p1:
    "评分都是 AI 模拟生成，依据是他们公开的写作和谈话；",
  about_panel_disclaimer_p2: "不代表本人的真实立场或对项目的背书。",
  about_section_pact: "承诺",
  about_pact_p1:
    "大多数尝试都会扔掉。这正是关键。真正复利的资产不是任何一个 app——而是这套<em>纪律</em>：每件事都写下 thesis / kill criteria / 时间预算；不和自己的 idea 谈恋爱；让评审团充分分歧。100 天结束时，整个 portfolio 自己会说话。",
  about_pact_p2:
    "到第 200 天，其中两三个会脱出账本本身，长成真正的产品。这就是这个赌注。",
  about_back_to_pipeline: "← 回到实验池",

  idea_entry_label: (id) => `日志条目 · №${id}`,
  idea_recorded: "记录",
  idea_budget: "预算",
  idea_shipped_at: "上线",
  idea_killed_at: "撤下",
  idea_stealth_inline: "隐身中",
  idea_panel_avg: "评审均分",
  idea_panel_avg_count: (n) => `/ 10 · ${n} 位`,
  idea_panel_section: "评审",
  idea_panel_pending: "尚未集结。",
  idea_sealed_title: "封存条目",
  idea_sealed_p1: "这条目的 thesis、kill criteria 和评审在动工或上线前不公开。",
  idea_sealed_p2: "渐进披露：保护进行中的 idea 不被预判，但仍登记在公开日志里。",
  idea_body_section: "正文",
  idea_link_url: "↗ 上线",
  idea_link_repo: "↗ 代码库",
  idea_back_to_pipeline: "← 回到实验池",
  idea_footer: (id) => `条目 №${id} · 完`,
  idea_stealth_description: (id) => `Idea №${id} · 隐身中，动工或上线后公开。`,

  card_stealth_label: "隐身",
  card_stealth_title: "隐身中——上线或撤掉后才公开",
  card_thesis_hidden: "—— thesis 在动工或上线前不公开。",
  card_recorded_at: (date) => `记录 ${date}`,
  card_budget: (budget) => `预算 ${budget}`,
  card_avg_label: "均分 / 10",
  card_avg_pending: "待评",
  card_sealed: "封存",
  card_sealed_title: "评审在上线或撤掉前不公开",

  status_idea: "想法",
  status_building: "在做",
  status_shipped: "已上线",
  status_killed: "已撤",

  panel_header_count: (n) => `评审团 · ${n} 位`,
  panel_header_subtitle: "投资人怎么说",
  panel_distilled: "完整蒸馏",
  panel_bootstrap: "v1 草稿",
  panel_stale: "过期",
  panel_stale_title: (was, now) =>
    `本评分基于 ${was}；当前 mentor 已升级到 ${now}，可重新评估。`,
  panel_pending: "等待评审。",
  panel_seat_open: "席位待补",
  panel_seat_open_subtitle: "蒸馏一位新顾问加入。",
  panel_invite_prefix: "还有一位评审可以加入。在项目里跑",
  panel_disclaimer_p1:
    "每张评分卡都是用 Claude 以这个人物的口吻 prompt 后生成的，依据是他们公开的写作、谈话和思考方式。重叠和分歧本身就是信号——但请记得，这些都不是本人的真实表态。",
  panel_disclaimer_p2: "◌ 是 v1 草稿，● 是完整蒸馏的 mentor。",

  loading_default_title: "投资人怎么说",
  loading_state_queued: "等待派单",
  loading_state_reading: "正在阅读",
  loading_state_consulting: "查阅档案",
  loading_state_composing: "起草批注",
  loading_state_signed: "已落款",
  loading_state_failed: "联络失败",
  loading_summary_done: (total) => `评审团 · ${total} 位 · 全部落款`,
  loading_summary_progress: (signed, total, failed) =>
    `评审团 · ${signed}/${total} 已落款${failed > 0 ? ` · ${failed} 位联络失败` : ""}`,
  loading_failed_msg: (name) => `联络 ${name} 失败。`,
  loading_retry: "重试 →",
  loading_disclaimer:
    "每张卡都是 AI 模拟，用 Claude 以这个人的口吻 prompt 生成，依据是他们公开的写作、谈话和思考方式。请勿当作本人的真实表态。",
  loading_avg_title: (n) => `基于 ${n} 位已落款评审的均分`,
  loading_avg_label: "均分",
  loading_in_progress: (n) => `${n} 位评审中`,

  bench_page_title: "顾问团 · 100 Apps Journey",
  bench_section_label: "顾问团",
  bench_headline_l1: "顾问团",
  bench_headline_l2: "评审席上的几个声音。",
  bench_intro:
    "每个 idea 都由这几位真人 mentor 的 AI 模拟评分。他们各自用自己的口吻、自己的 mental model 思考——分歧本身就是信号。",
  bench_empty_title: "顾问团暂时空着。",
  bench_empty_subtitle: "下方蒸馏第一位 mentor。",
  bench_count_seated: (n) => `在席 ${n} 位`,
  bench_count_distilled: (n) => `${n} ● 完整蒸馏`,
  bench_count_bootstrap: (n) => `${n} ◌ 草稿态`,
  bench_card_models: "心智模型",
  bench_card_heuristics: "启发式",
  bench_card_sources: "一手来源",
  bench_card_distilled: "完整态",
  bench_card_bootstrap: "草稿态",
  bench_distill_section: "蒸馏新 mentor",
  bench_distill_intro: "顾问团默认封闭。",
  bench_distill_explainer:
    '这里没有"添加"按钮。每位 mentor 都通过 Claude Code 里的 6-agent 调研 pipeline 蒸馏出来。输入一个名字，下面会给你对应的命令——粘贴执行即可。',
  bench_distill_name_label: "名字",
  bench_distill_paste_label: "粘贴到 Claude Code",
  bench_distill_copy: "复制",
  bench_distill_copied: "已复制到剪贴板",
  bench_distill_prereq_title: "前置条件",
  bench_distill_prereq_node: "Node 22+ 和 Bun ≥ 1.1",
  bench_distill_prereq_cc: "已安装 Claude Code 并打开本项目",
  bench_distill_prereq_env: "里有",
  bench_distill_cost_title: "成本与耗时",
  bench_distill_cost_api: "每次蒸馏约 $1–2 API 费用",
  bench_distill_cost_time: "执行约 5–15 分钟",
  bench_distill_cost_review: "外加约 30 分钟认真 review 各 checkpoint 的时间",
  bench_distill_pipeline_p1:
    "Pipeline 从公开来源（书、演讲、采访、社媒）蒸馏出 mental model、决策启发式和表达 DNA，每条来源按 4 维可靠性 rubric 评分。结果落到",
  bench_distill_pipeline_p2: "，新 mentor 自动加入评审团。中断后恢复用：",

  mentor_page_title_suffix: "· 顾问团 · 100 Apps Journey",
  mentor_advisor_label: "顾问",
  mentor_v1_callout_p1: "这位 mentor 目前是",
  mentor_v1_callout_p2:
    "草稿态——从公开来源手工蒸馏的种子版。在 Claude Code 里跑",
  mentor_voiceprint_section: "声纹 · 一眼能认出他的样子",
  mentor_models_section: "心智模型",
  mentor_models_intro: "他看世界的视角。点击展开 evidence 和 limits。",
  mentor_expand: "▸ 展开",
  mentor_collapse: "▾ 收起",
  mentor_evidence: "依据",
  mentor_application: "应用",
  mentor_limits: "局限",
  mentor_heuristics_section: "决策启发式",
  mentor_heuristics_intro: "他做快判断时用的规则。",
  mentor_when: "适用：",
  mentor_example: "例：",
  mentor_dna_section: "表达 DNA",
  mentor_dna_sentence: "句式",
  mentor_dna_vocab: "词汇",
  mentor_dna_rhythm: "节奏",
  mentor_dna_humor: "幽默",
  mentor_dna_certainty: "确定性",
  mentor_dna_citations: "引用习惯",
  mentor_values_section: "价值观",
  mentor_antipatterns_section: "反模式",
  mentor_tensions_section: "内在张力",
  mentor_boundaries_section: "诚实边界",
  mentor_boundaries_intro: "这次蒸馏不能做什么。",
  mentor_lineage_section: "智识谱系",
  mentor_primary_section: "一手来源",
  mentor_primary_empty: "暂未整理。",
  mentor_secondary_section: "二手参考",
  mentor_secondary_empty: "暂未整理。",
  mentor_back_to_bench: "← 顾问团",
  mentor_version_complete: "完整态",
  mentor_version_draft: "草稿态 · v1",
  mentor_version_short_complete: "完整态",
  mentor_version_short_draft: "草稿态",
  mentor_research_date: (label, date) => `${label} · 调研于 ${date}`,

  preview_page_title: "开发预览 · 100 Apps Journey",
  preview_dev_only_msg: "这是 dev-only 页面。",
  preview_dev_only_explainer_p1:
    "LoadingPanel demo 用",
  preview_dev_only_explainer_p2:
    "gate——本地运行 bun run dev 才能看到。",
  preview_back_to_pipeline: "← 回到实验池",

  settings_page_title: "设置 · 100 Apps Journey",
  settings_section_label: "设置",
  settings_headline: "你自己的 API Key。",
  settings_intro_p1:
    "顾问团的对话功能（Clarify、单聊、群聊）由 Anthropic Claude 驱动。本站不替你出 API 钱——你填自己的 key，按你自己的账单结。",
  settings_intro_p2:
    "Key 只存在你浏览器的 localStorage 里。每次对话时通过 HTTPS 转发给 Anthropic，本服务器不记日志、不持久化。",
  settings_key_label: "Anthropic API Key",
  settings_key_placeholder: "sk-ant-api03-...",
  settings_key_help: "格式：sk-ant- 开头",
  settings_btn_test: "测试 key",
  settings_btn_save: "保存",
  settings_btn_clear: "清除",
  settings_status_testing: "正在 ping Anthropic...",
  settings_status_ok: "✓ Key 有效",
  settings_status_invalid: (msg) => `✕ Key 无效：${msg}`,
  settings_status_saved: "✓ 已保存到浏览器",
  settings_status_cleared: "已清除",
  settings_status_present: "已设置 key（不显示原值）",
  settings_get_key_link: "去 Anthropic Console 拿一个 →",
  settings_privacy_title: "隐私",
  settings_privacy_p1:
    "你的 key 永远不会被本站持久化。每次对话请求时通过 HTTPS header 转发给 Anthropic，请求结束即丢弃。",
  settings_privacy_p2:
    "对话历史也仅存在你浏览器本地。换设备不会同步。删除浏览器数据即清空所有记录。",
  nav_settings: "设置",

  keymodal_title: "需要先设置 API Key",
  keymodal_p1:
    "顾问团对话功能由你自己的 Anthropic key 驱动（本站不出钱）。先去设置页填一个再回来。",
  keymodal_p2: "已经有 Anthropic 账号？花 30 秒就好。",
  keymodal_open_settings: "去设置 →",
  keymodal_dismiss: "稍后",

  chat_open_with: (mentorName) => `和 ${mentorName} 聊 →`,
  chat_open_panel: "打开顾问团圆桌 →",
  chat_close: "关闭",
  chat_drawer_subtitle_1on1: (mentorName) => `单独和 ${mentorName} 对话`,
  chat_drawer_subtitle_group: "顾问团圆桌讨论",
  chat_composer_placeholder: "继续问下去...",
  chat_send: "发送",
  chat_thinking: "正在思考...",
  chat_error_prefix: "出错：",
  chat_cap_reached: (n) => `已达到 ${n} 轮上限。新开一段对话或清空历史。`,
  chat_cost_hint: "≈ $0.02-0.05/轮，从你自己的 Anthropic 账户出",
  chat_clear_history: "清空本对话",
  chat_clear_confirm: "确定清空？历史不可恢复。",
  chat_empty_1on1: (mentorName) =>
    `对话还没开始。${mentorName} 会先问你一个问题——按 "发送" 让他开口。`,
  chat_empty_group: "圆桌还没开。按 \"发送\" 让所有顾问对这个 idea 各说一句。",
  chat_role_you: "你",

  clarify_refined_label: "对话后",
  clarify_original_label: "对话前",
  clarify_score_diff: (delta) =>
    delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : "持平",

  rescore_btn: "请重新评分 →",
  rescore_btn_disabled_hint: "至少聊一轮再重新评分",
  rescore_loading: "正在重新评估...",
  rescore_done: (delta) =>
    delta > 0
      ? `✓ 已重新评分（+${delta}）。下方 mentor 卡有新分对照`
      : delta < 0
        ? `✓ 已重新评分（${delta}）。下方 mentor 卡有新分对照`
        : "✓ 已重新评分（持平）。下方 mentor 卡已更新",
  rescore_failed: (msg) => `重新评分失败：${msg}`,

  group_speaker_label: (mentorName) => `${mentorName} 在说`,
  group_pass_msg: "（这一轮我没什么要补充的。）",
  group_mention_hint: "用 @ 加名字可以指定让谁先说",
};

const en: Strings = {
  htmlLang: "en",
  site_description:
    "A public ledger of small app experiments — each idea evaluated by an AI-simulated panel of real-world investors and builders.",

  masthead_volume: "Vol. I · MMXXVI",
  nav_pipeline: "Pipeline",
  nav_standings: "Standings",
  nav_bench: "Bench",
  nav_method: "Method",
  lang_toggle_to: "中",

  footer_section_index: "Index",
  footer_section_about_panel: "About the panel",
  footer_section_typography: "Typography",
  footer_disclaimer:
    "All panel evaluations on this site are AI-generated simulations, based on each individual's public writings, talks, and patterns of thought. They are not actual statements or endorsements from the people depicted.",
  footer_typography_label: "Type · Fraunces · Spectral · Noto Serif SC · JetBrains Mono",

  home_section_label: "Pipeline · Vol. 001",
  home_headline_l1: "100 attempts.",
  home_headline_l2: "100 days.",
  home_headline_l3: "1 portfolio.",
  home_intro:
    "A public log of small experiments — each idea judged by an AI-simulated panel of real-world investors. Sharp opinions, sharper disagreements.",
  home_as_of: (date) => `As of ${date}`,
  home_stats_recorded: "Recorded",
  home_stats_idea: "Ideas",
  home_stats_building: "Building",
  home_stats_shipped: "Shipped",
  home_stats_killed: "Killed",
  home_empty_title: "No ideas yet.",
  home_empty_subtitle: "The journey begins with the first entry.",

  stats_page_title: "Standings · 100 Apps Journey",
  stats_section_label: "Standings",
  stats_headline_l1: "How the panel",
  stats_headline_l2: "leans on aggregate.",
  stats_empty_l1: "Nothing recorded yet.",
  stats_empty_l2: "Trends will surface as entries accumulate.",
  stats_block_pipeline_title: "Pipeline composition",
  stats_block_pipeline_desc: (total) =>
    `Distribution across ${total} recorded idea${total === 1 ? "" : "s"}. Shape tells you whether the funnel is healthy — too many in "ideas" is paralysis; too few "killed" is sentimentality.`,
  stats_block_panel_avg_title: "Panel averages",
  stats_block_panel_avg_desc:
    "Each judge's mean across all ideas. The outliers matter more than the absolute numbers — who stays harsh, who cheerleads, where the splits live.",
  stats_block_panel_avg_count: (n) => `${n} score${n === 1 ? "" : "s"}`,
  stats_block_distribution_title: "Score distribution",
  stats_block_distribution_desc: (n) =>
    `Cluster shape across ${n} individual score${n === 1 ? "" : "s"}. Bimodal means strong opinions; piling at the median means the panel is being polite.`,
  stats_block_top_title: "Top scoring",
  stats_block_top_desc: "Highest panel-average ideas.",
  stats_block_top_empty: "No scored entries yet.",
  stats_block_divisive_title: "Most divisive",
  stats_block_divisive_desc: "Largest spread between max and min scores.",
  stats_block_divisive_empty:
    "Need at least two scores per idea to detect division.",

  about_page_title: "Method · 100 Apps Journey",
  about_section_label: "Method",
  about_headline: "Why 100 days,<br />100 apps.",
  about_section_premise: "Premise",
  about_premise_p1:
    "AI compressed the cost of building a working prototype from weeks to hours. The constraint isn't engineering capacity anymore — it's <em>knowing what to build</em>. The most efficient way to find out is to build, ship, observe, decide.",
  about_premise_p2:
    "This site is the public ledger of that experiment: 100 small attempts in 100 days. Each handled like an angel investment — a thesis, a kill criterion, a time budget. Most will fail; a few will show signal. Portfolio thinking starts from accepting you can't predict which one is the outlier — only finding out by trying.",
  about_section_framework: "Framework",
  about_framework_intro: "Every entry has four required fields, as constraints:",
  about_framework_thesis:
    "<strong>Thesis</strong> — why this might be valuable, in one or two sentences.",
  about_framework_kill:
    "<strong>Kill criteria</strong> — the conditions under which it gets pulled without ceremony.",
  about_framework_budget:
    "<strong>Time budget</strong> — the cap on investment before re-evaluation.",
  about_framework_tags:
    "<strong>Tags</strong> — domain markers for later pattern-finding.",
  about_section_panel: "The panel",
  about_panel_p1:
    "Every idea is scored by a panel of AI-simulated investors and builders. Each reasons in their own voice — drawn from their public writings, talks, and social posts — without artificial role-splits. Perspectives overlap and diverge; each brings their full judgment frame.",
  about_panel_disclaimer_p1:
    "All scores are AI-generated simulations, based on each person's public writings and talks;",
  about_panel_disclaimer_p2:
    "they don't represent actual positions or endorsements.",
  about_section_pact: "The pact",
  about_pact_p1:
    "Most attempts will be thrown away. That's the point. The compounding asset isn't any single app — it's the <em>discipline</em>: thesis / kill / budget written every time; not falling in love with one's own ideas; letting the panel disagree fully. By day 100 the portfolio speaks for itself.",
  about_pact_p2:
    "By day 200, two or three will outgrow the ledger and become real products. That's the bet.",
  about_back_to_pipeline: "← Back to pipeline",

  idea_entry_label: (id) => `Entry · №${id}`,
  idea_recorded: "Recorded",
  idea_budget: "Budget",
  idea_shipped_at: "Shipped",
  idea_killed_at: "Killed",
  idea_stealth_inline: "in stealth",
  idea_panel_avg: "Panel average",
  idea_panel_avg_count: (n) => `/ 10 · ${n} judge${n === 1 ? "" : "s"}`,
  idea_panel_section: "Panel",
  idea_panel_pending: "Not convened yet.",
  idea_sealed_title: "Sealed entry",
  idea_sealed_p1:
    "This entry's thesis, kill criteria, and panel are not public until building or shipping starts.",
  idea_sealed_p2:
    "Progressive disclosure: protects in-progress ideas from premature judgment while still keeping them on the public ledger.",
  idea_body_section: "Body",
  idea_link_url: "↗ Live",
  idea_link_repo: "↗ Repo",
  idea_back_to_pipeline: "← Back to pipeline",
  idea_footer: (id) => `Entry №${id} · End`,
  idea_stealth_description: (id) =>
    `Idea №${id} · in stealth — public once building or shipped.`,

  card_stealth_label: "Stealth",
  card_stealth_title: "In stealth — public once shipped or killed",
  card_thesis_hidden: "— thesis withheld until building or shipping starts.",
  card_recorded_at: (date) => `Logged ${date}`,
  card_budget: (budget) => `Budget ${budget}`,
  card_avg_label: "Avg / 10",
  card_avg_pending: "Pending",
  card_sealed: "Sealed",
  card_sealed_title: "Panel withheld until shipped or killed",

  status_idea: "Idea",
  status_building: "Building",
  status_shipped: "Shipped",
  status_killed: "Killed",

  panel_header_count: (n) => `Panel · ${n} judge${n === 1 ? "" : "s"}`,
  panel_header_subtitle: "What the panel said",
  panel_distilled: "Distilled",
  panel_bootstrap: "v1 draft",
  panel_stale: "stale",
  panel_stale_title: (was, now) =>
    `This score was generated against ${was}; the mentor has since been upgraded to ${now} — re-evaluation recommended.`,
  panel_pending: "Awaiting the panel.",
  panel_seat_open: "Seat open",
  panel_seat_open_subtitle: "Distill a new advisor to fill it.",
  panel_invite_prefix: "There's room for one more judge. In the project, run",
  panel_disclaimer_p1:
    "Each card is generated by Claude prompted in this person's voice, based on their public writings, talks, and patterns of thought. Overlap and disagreement are themselves signal — but remember, none of these are actual statements from the people depicted.",
  panel_disclaimer_p2:
    "◌ marks v1 drafts; ● marks fully distilled mentors.",

  loading_default_title: "What the panel said",
  loading_state_queued: "Awaiting brief",
  loading_state_reading: "Reading the file",
  loading_state_consulting: "Consulting the record",
  loading_state_composing: "Composing the note",
  loading_state_signed: "Signed",
  loading_state_failed: "Could not reach",
  loading_summary_done: (total) => `Panel · ${total} judges · all signed`,
  loading_summary_progress: (signed, total, failed) =>
    `Panel · ${signed}/${total} signed${failed > 0 ? ` · ${failed} unreachable` : ""}`,
  loading_failed_msg: (name) => `Could not reach ${name}.`,
  loading_retry: "Retry →",
  loading_disclaimer:
    "Each card is an AI simulation, prompted with this person's voice via Claude, based on their public writings, talks, and patterns of thought. Not actual statements.",
  loading_avg_title: (n) => `Average across ${n} signed evaluation${n === 1 ? "" : "s"}`,
  loading_avg_label: "Avg",
  loading_in_progress: (n) => `${n} judge${n === 1 ? "" : "s"} in flight`,

  bench_page_title: "Bench · 100 Apps Journey",
  bench_section_label: "Bench",
  bench_headline_l1: "The bench.",
  bench_headline_l2: "The voices on the panel.",
  bench_intro:
    "Every idea is scored by AI simulations of these real-world mentors. Each thinks in their own voice, with their own mental models — the disagreement is itself the signal.",
  bench_empty_title: "The bench is empty for now.",
  bench_empty_subtitle: "Distill the first mentor below.",
  bench_count_seated: (n) => `${n} seated`,
  bench_count_distilled: (n) => `${n} ● distilled`,
  bench_count_bootstrap: (n) => `${n} ◌ draft`,
  bench_card_models: "models",
  bench_card_heuristics: "heuristics",
  bench_card_sources: "primary sources",
  bench_card_distilled: "Distilled",
  bench_card_bootstrap: "Draft",
  bench_distill_section: "Distill a new mentor",
  bench_distill_intro: "The bench is closed by default.",
  bench_distill_explainer:
    'There is no "Add" button. Each mentor is distilled via the 6-agent research pipeline in Claude Code. Type a name; the command appears below — paste and run.',
  bench_distill_name_label: "Name",
  bench_distill_paste_label: "Paste into Claude Code",
  bench_distill_copy: "Copy",
  bench_distill_copied: "Copied to clipboard",
  bench_distill_prereq_title: "Prerequisites",
  bench_distill_prereq_node: "Node 22+ and Bun ≥ 1.1",
  bench_distill_prereq_cc: "Claude Code installed, with this project open",
  bench_distill_prereq_env: "set in",
  bench_distill_cost_title: "Cost & time",
  bench_distill_cost_api: "≈ $1–2 in API cost per distillation",
  bench_distill_cost_time: "≈ 5–15 minutes execution",
  bench_distill_cost_review: "plus ≈ 30 minutes of attentive checkpoint review",
  bench_distill_pipeline_p1:
    "The pipeline distills mental models, decision heuristics, and expression DNA from public sources (books, talks, interviews, social) — each source scored against a 4-dimension reliability rubric. Results land in",
  bench_distill_pipeline_p2: "and the new mentor joins the panel automatically. Resume after interruption with:",

  mentor_page_title_suffix: "· Bench · 100 Apps Journey",
  mentor_advisor_label: "Advisor",
  mentor_v1_callout_p1: "This mentor is currently a",
  mentor_v1_callout_p2:
    "draft — a hand-distilled seed version from public sources. In Claude Code, run",
  mentor_voiceprint_section: "Voiceprint · how to recognize them",
  mentor_models_section: "Mental models",
  mentor_models_intro:
    "How they see the world. Click to expand evidence and limits.",
  mentor_expand: "▸ Expand",
  mentor_collapse: "▾ Collapse",
  mentor_evidence: "Evidence",
  mentor_application: "Application",
  mentor_limits: "Limits",
  mentor_heuristics_section: "Decision heuristics",
  mentor_heuristics_intro: "The rules they reach for under time pressure.",
  mentor_when: "When:",
  mentor_example: "e.g.,",
  mentor_dna_section: "Expression DNA",
  mentor_dna_sentence: "Sentences",
  mentor_dna_vocab: "Vocabulary",
  mentor_dna_rhythm: "Rhythm",
  mentor_dna_humor: "Humor",
  mentor_dna_certainty: "Certainty",
  mentor_dna_citations: "Citations",
  mentor_values_section: "Values",
  mentor_antipatterns_section: "Anti-patterns",
  mentor_tensions_section: "Inner tensions",
  mentor_boundaries_section: "Honest limits",
  mentor_boundaries_intro: "What this distillation cannot do.",
  mentor_lineage_section: "Intellectual lineage",
  mentor_primary_section: "Primary sources",
  mentor_primary_empty: "Not yet catalogued.",
  mentor_secondary_section: "Secondary references",
  mentor_secondary_empty: "Not yet catalogued.",
  mentor_back_to_bench: "← Bench",
  mentor_version_complete: "fully distilled",
  mentor_version_draft: "draft · v1",
  mentor_version_short_complete: "Distilled",
  mentor_version_short_draft: "Draft",
  mentor_research_date: (label, date) => `${label} · researched ${date}`,

  preview_page_title: "Dev preview · 100 Apps Journey",
  preview_dev_only_msg: "This is a dev-only page.",
  preview_dev_only_explainer_p1: "The LoadingPanel demo is gated by",
  preview_dev_only_explainer_p2:
    "— only visible when you run bun run dev locally.",
  preview_back_to_pipeline: "← Back to pipeline",

  settings_page_title: "Settings · 100 Apps Journey",
  settings_section_label: "Settings",
  settings_headline: "Your own API key.",
  settings_intro_p1:
    "The chat features (Clarify, 1-on-1, Panel) run on Anthropic Claude. This site doesn't pay for your usage — bring your own key, billed to your own Anthropic account.",
  settings_intro_p2:
    "The key lives only in your browser's localStorage. It's forwarded over HTTPS to Anthropic per request. This server never logs or persists it.",
  settings_key_label: "Anthropic API Key",
  settings_key_placeholder: "sk-ant-api03-...",
  settings_key_help: "Format: starts with sk-ant-",
  settings_btn_test: "Test key",
  settings_btn_save: "Save",
  settings_btn_clear: "Clear",
  settings_status_testing: "Pinging Anthropic...",
  settings_status_ok: "✓ Key works",
  settings_status_invalid: (msg) => `✕ Key invalid: ${msg}`,
  settings_status_saved: "✓ Saved to your browser",
  settings_status_cleared: "Cleared",
  settings_status_present: "Key is set (value not displayed)",
  settings_get_key_link: "Get one at Anthropic Console →",
  settings_privacy_title: "Privacy",
  settings_privacy_p1:
    "Your key is never persisted on this site. Each chat request forwards it to Anthropic via HTTPS header, then discards it.",
  settings_privacy_p2:
    "Chat history also lives only in your browser. It does not sync across devices. Clearing browser data wipes everything.",
  nav_settings: "Settings",

  keymodal_title: "Add an API key first",
  keymodal_p1:
    "The mentor chat features run on your own Anthropic key (this site doesn't cover usage). Add one in settings and come back.",
  keymodal_p2: "Already have an Anthropic account? 30 seconds.",
  keymodal_open_settings: "Open settings →",
  keymodal_dismiss: "Later",

  chat_open_with: (mentorName) => `Talk to ${mentorName} →`,
  chat_open_panel: "Open panel discussion →",
  chat_close: "Close",
  chat_drawer_subtitle_1on1: (mentorName) => `1-on-1 with ${mentorName}`,
  chat_drawer_subtitle_group: "Bench panel discussion",
  chat_composer_placeholder: "Push back, ask, or commit...",
  chat_send: "Send",
  chat_thinking: "Thinking...",
  chat_error_prefix: "Error: ",
  chat_cap_reached: (n) => `Conversation cap (${n} turns) reached. Start a new chat or clear history.`,
  chat_cost_hint: "≈ $0.02-0.05/turn, billed to your own Anthropic account",
  chat_clear_history: "Clear this conversation",
  chat_clear_confirm: "Clear chat history? This can't be undone.",
  chat_empty_1on1: (mentorName) =>
    `Conversation hasn't started. ${mentorName} will open with one sharp question — hit "Send" to let them speak.`,
  chat_empty_group: "Panel hasn't convened. Hit \"Send\" to let all mentors weigh in on this idea.",
  chat_role_you: "You",

  clarify_refined_label: "After dialogue",
  clarify_original_label: "Before dialogue",
  clarify_score_diff: (delta) =>
    delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : "no change",

  rescore_btn: "Ask for fresh score →",
  rescore_btn_disabled_hint: "Chat at least one turn before rescoring",
  rescore_loading: "Re-evaluating...",
  rescore_done: (delta) =>
    delta > 0
      ? `✓ Rescored (+${delta}). New score now under their card on the page`
      : delta < 0
        ? `✓ Rescored (${delta}). New score now under their card on the page`
        : "✓ Rescored (no change). Card on the page is up to date",
  rescore_failed: (msg) => `Rescore failed: ${msg}`,

  group_speaker_label: (mentorName) => `${mentorName} is speaking`,
  group_pass_msg: "(I have nothing to add this round.)",
  group_mention_hint: "Use @ + name to call on a specific mentor",
};

export const STRINGS: Record<Lang, Strings> = { zh, en };
