/**
 * Refined-evaluation persistence + rendering helpers.
 *
 * The standalone Clarify modal was retired (chat IS clarification — they
 * do the same job and two CTAs were redundant). Re-scoring now happens
 * inside ChatDrawer via the "请重新评分 / Ask for fresh score" button.
 *
 * What stays here:
 *   - localStorage CRUD for refined evaluations
 *   - DOM helper to draw the side-by-side refined card under a mentor's
 *     evaluation on the idea page
 *   - hydrate-on-page-load helper that re-attaches refined cards from
 *     localStorage on every visit
 *
 * The drawer calls `attachRefinedCard()` after a successful rescore POST
 * so the result shows up under the mentor's evaluation card immediately.
 */

import { getLang, STRINGS } from "../i18n";

export interface RefinedEvaluation {
  score: number;
  reasoning: string;
  dimensions?: Array<{ name: string; verdict: "pass" | "fail" | "unclear"; note: string }>;
  refined_at: string;
  mentor: string;
  ideaId: string;
}

const REFINED_KEY = (idea: string, mentor: string) => `refined:${idea}:${mentor}`;

export function getRefined(idea: string, mentor: string): RefinedEvaluation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(REFINED_KEY(idea, mentor));
    return raw ? (JSON.parse(raw) as RefinedEvaluation) : null;
  } catch {
    return null;
  }
}

export function setRefined(r: RefinedEvaluation): void {
  try {
    localStorage.setItem(REFINED_KEY(r.ideaId, r.mentor), JSON.stringify(r));
  } catch {
    /* ignore */
  }
}

/** Draw a refined card below the original evaluation. */
function renderRefinedCard(
  refined: RefinedEvaluation,
  accent: string,
  card: Element | null,
) {
  if (!card) return;
  // Remove any prior refined card we drew so re-runs replace
  card.querySelectorAll("[data-refined-card]").forEach((n) => n.remove());

  const s = STRINGS[getLang(new URL(window.location.href))];
  const original = parseInt(
    card.querySelector(".font-display[style*='color']")?.textContent || "0",
    10,
  );
  const delta = refined.score - original;
  const deltaText = s.clarify_score_diff(delta);

  const el = document.createElement("div");
  el.setAttribute("data-refined-card", "1");
  el.className = "mt-4 pt-4 border-t border-rule";
  el.innerHTML = `
    <div class="flex items-baseline gap-2 mb-2">
      <span class="font-mono text-[9px] uppercase tracking-[0.2em]" style="color: ${accent}">${escapeHtml(s.clarify_refined_label)}</span>
      <span class="font-mono text-[9px] uppercase tracking-[0.15em] text-ink-soft">${escapeHtml(deltaText)}</span>
    </div>
    <div class="flex items-baseline gap-1.5 mb-2">
      <span class="font-display font-medium text-[48px] leading-[0.85] tabular-nums" style="color: ${accent}">${refined.score}</span>
      <span class="font-mono text-[11px] uppercase tracking-wider text-ink-soft">/ 10</span>
    </div>
    <p class="font-body text-[13.5px] leading-[1.7] text-ink relative pl-3 border-l border-rule">${escapeHtml(refined.reasoning)}</p>`;
  card.appendChild(el);
}

/** Look up the mentor's evaluation card on the page by data attribute. */
function findMentorCard(mentor: string): Element | null {
  // Each "talk to" trigger button sits inside the evaluation `<article>`,
  // so we can locate the card via the trigger.
  const trigger = document.querySelector<HTMLElement>(
    `[data-chat-trigger][data-chat-mentor="${cssEscape(mentor)}"]`,
  );
  return trigger?.closest("article") ?? null;
}

/**
 * Persist + draw a refined card for this mentor's evaluation. Called by
 * the chat drawer after a successful rescore POST.
 */
export function attachRefinedCard(refined: RefinedEvaluation, accent: string): void {
  setRefined(refined);
  const card = findMentorCard(refined.mentor);
  renderRefinedCard(refined, accent, card);
}

/** Render any refined cards on initial page load from localStorage. */
export function hydrateRefinedCards() {
  document.querySelectorAll<HTMLElement>("[data-chat-trigger][data-chat-mentor]").forEach((el) => {
    const ideaId = el.dataset.chatIdea || "";
    const mentor = el.dataset.chatMentor || "";
    const accent = el.dataset.chatMentorAccent || "#666";
    if (!ideaId || !mentor) return;
    const r = getRefined(ideaId, mentor);
    if (!r) return;
    const card = el.closest("article");
    renderRefinedCard(r, accent, card);
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function cssEscape(s: string): string {
  // Defensive — mentor slugs are simple ASCII (a-z, dash) so this is
  // a belt-and-braces measure for the querySelector attribute lookup.
  return s.replace(/(["\\])/g, "\\$1");
}
