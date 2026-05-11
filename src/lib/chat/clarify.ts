/**
 * Client-side controller for ClarifyModal.
 *
 * Wires up the [data-clarify-trigger] buttons rendered by InvestorPanel.
 * Two-phase API call:
 *   1. POST /api/chat/clarify/<mentor> { phase: "questions", ideaId } → list
 *   2. POST same endpoint { phase: "rescore", ideaId, questions, answers }
 *      → refined evaluation, persisted to localStorage as `refined:<idea>:<mentor>`.
 *
 * Refined evaluations are then read by clarify-render.ts to draw the
 * "refined" side-by-side card under the original.
 */

import { getApiKey, hasApiKey } from "./storage";
import { getLang, STRINGS } from "../i18n";

interface RefinedEvaluation {
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

function setRefined(r: RefinedEvaluation): void {
  try {
    localStorage.setItem(REFINED_KEY(r.ideaId, r.mentor), JSON.stringify(r));
  } catch {
    /* ignore */
  }
}

interface ClarifyContext {
  ideaId: string;
  mentor: string;
  mentorName: string;
  mentorAccent: string;
  originalScore?: number;
  originalReasoning?: string;
  onComplete: (refined: RefinedEvaluation) => void;
}

class ClarifyController {
  private overlay: HTMLDivElement;
  private box: HTMLDivElement;
  private s = STRINGS[getLang(new URL(window.location.href))];

  constructor() {
    this.overlay = document.createElement("div");
    this.overlay.className = "hidden fixed inset-0 z-50 bg-ink/40 flex items-center justify-center p-5";
    this.overlay.id = "clarify-overlay";
    this.box = document.createElement("div");
    this.box.className = "bg-paper border border-rule max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl";
    this.overlay.appendChild(this.box);
    document.body.appendChild(this.overlay);
    this.overlay.addEventListener("click", (e) => {
      if (e.target === this.overlay) this.close();
    });
  }

  close() {
    this.overlay.classList.add("hidden");
    this.box.innerHTML = "";
  }

  async open(ctx: ClarifyContext) {
    if (!hasApiKey()) {
      // Reuse the global key modal by clicking-through: simplest is a redirect-style alert
      alert(this.s.keymodal_title + "\n" + this.s.keymodal_p1);
      window.location.href = "/settings";
      return;
    }
    this.overlay.classList.remove("hidden");
    this.renderLoading(ctx);

    let questions: string[] = [];
    try {
      const res = await fetch(`/api/chat/clarify/${ctx.mentor}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-User-Anthropic-Key": getApiKey()! },
        body: JSON.stringify({ phase: "questions", ideaId: ctx.ideaId }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { questions: string[] };
      questions = data.questions;
    } catch (e) {
      this.renderError(String(e));
      return;
    }

    this.renderQuestions(ctx, questions);
  }

  private renderLoading(ctx: ClarifyContext) {
    this.box.innerHTML = `
      <p class="font-mono text-[10px] uppercase tracking-[0.22em] mb-2" style="color: ${ctx.mentorAccent}">${escapeHtml(this.s.clarify_modal_title(ctx.mentorName))}</p>
      <p class="font-body italic text-sm text-ink-soft">${escapeHtml(this.s.clarify_loading_questions)}</p>`;
  }

  private renderError(msg: string) {
    const err = `${this.s.chat_error_prefix}${msg}`;
    this.box.innerHTML = `
      <p class="font-body text-sm text-killed">${escapeHtml(err)}</p>
      <button type="button" class="mt-4 font-mono text-xs uppercase tracking-[0.18em] text-ink-soft hover:text-seal" id="clarify-close-err">${escapeHtml(this.s.chat_close)}</button>`;
    this.box.querySelector("#clarify-close-err")?.addEventListener("click", () => this.close());
  }

  private renderQuestions(ctx: ClarifyContext, questions: string[]) {
    const list = questions
      .map(
        (q, i) => `
      <label class="block mb-5">
        <p class="font-body text-[15px] text-ink mb-2 leading-snug"><span class="font-mono text-[10px] uppercase tracking-[0.18em] mr-2" style="color: ${ctx.mentorAccent}">${String(i + 1).padStart(2, "0")}</span>${escapeHtml(q)}</p>
        <textarea
          data-q-idx="${i}"
          rows="3"
          placeholder="${escapeHtml(this.s.clarify_answer_placeholder)}"
          class="w-full bg-transparent border border-rule focus:border-seal outline-none font-body text-sm px-3 py-2 resize-none transition-colors"
        ></textarea>
      </label>`,
      )
      .join("");
    this.box.innerHTML = `
      <p class="font-mono text-[10px] uppercase tracking-[0.22em] mb-2" style="color: ${ctx.mentorAccent}">${escapeHtml(this.s.clarify_modal_title(ctx.mentorName))}</p>
      <p class="font-body italic text-sm text-ink-soft mb-5 leading-snug">${escapeHtml(this.s.clarify_modal_intro)}</p>
      ${list}
      <div class="flex justify-end gap-3 mt-2">
        <button type="button" id="clarify-cancel" class="font-mono text-xs uppercase tracking-[0.18em] text-ink-soft hover:text-ink">${escapeHtml(this.s.chat_close)}</button>
        <button type="button" id="clarify-submit" class="font-mono text-xs uppercase tracking-[0.18em] border border-seal text-seal px-4 py-2 hover:bg-seal hover:text-paper transition-colors">${escapeHtml(this.s.clarify_submit)}</button>
      </div>`;
    this.box.querySelector("#clarify-cancel")?.addEventListener("click", () => this.close());
    this.box.querySelector("#clarify-submit")?.addEventListener("click", async () => {
      const answers = Array.from(this.box.querySelectorAll<HTMLTextAreaElement>("textarea[data-q-idx]"))
        .sort((a, b) => Number(a.dataset.qIdx) - Number(b.dataset.qIdx))
        .map((t) => t.value.trim());
      if (answers.every((a) => !a)) {
        // need at least one answer
        return;
      }
      await this.submitRescore(ctx, questions, answers);
    });
  }

  private async submitRescore(ctx: ClarifyContext, questions: string[], answers: string[]) {
    this.box.innerHTML = `
      <p class="font-mono text-[10px] uppercase tracking-[0.22em] mb-2" style="color: ${ctx.mentorAccent}">${escapeHtml(this.s.clarify_modal_title(ctx.mentorName))}</p>
      <p class="font-body italic text-sm text-ink-soft">${escapeHtml(this.s.clarify_recomputing)}</p>`;
    try {
      const res = await fetch(`/api/chat/clarify/${ctx.mentor}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-User-Anthropic-Key": getApiKey()! },
        body: JSON.stringify({
          phase: "rescore",
          ideaId: ctx.ideaId,
          questions,
          answers,
          original:
            ctx.originalScore !== undefined && ctx.originalReasoning
              ? { score: ctx.originalScore, reasoning: ctx.originalReasoning }
              : undefined,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const refined = (await res.json()) as {
        score: number;
        reasoning: string;
        dimensions?: RefinedEvaluation["dimensions"];
        refined_at: string;
      };
      const stored: RefinedEvaluation = { ...refined, mentor: ctx.mentor, ideaId: ctx.ideaId };
      setRefined(stored);
      ctx.onComplete(stored);
      this.box.innerHTML = `<p class="font-body text-sm text-ink leading-relaxed mb-4">${escapeHtml(this.s.clarify_done)}</p>
        <button type="button" id="clarify-close-ok" class="font-mono text-xs uppercase tracking-[0.18em] border border-seal text-seal px-4 py-2 hover:bg-seal hover:text-paper transition-colors">${escapeHtml(this.s.chat_close)}</button>`;
      this.box.querySelector("#clarify-close-ok")?.addEventListener("click", () => this.close());
    } catch (e) {
      this.renderError(String(e));
    }
  }
}

let _instance: ClarifyController | null = null;

export function bindClarifyTriggers() {
  if (!_instance) _instance = new ClarifyController();
  document.querySelectorAll<HTMLElement>("[data-clarify-trigger]").forEach((el) => {
    if (el.dataset.clarifyBound === "1") return;
    el.dataset.clarifyBound = "1";
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const ideaId = el.dataset.chatIdea || "";
      const mentor = el.dataset.chatMentor || "";
      const mentorName = el.dataset.chatMentorName || mentor;
      const mentorAccent = el.dataset.chatMentorAccent || "#666";
      // Look up the existing card to pull original score + reasoning for context.
      const card = el.closest("article");
      const scoreEl = card?.querySelector(".font-display[style*='color']");
      const original = scoreEl ? parseInt(scoreEl.textContent || "0", 10) : undefined;
      const reasoningEl = card?.querySelector("p.font-body.text-\\[13\\.5px\\]");
      const originalReasoning = reasoningEl?.textContent?.trim();
      _instance!.open({
        ideaId,
        mentor,
        mentorName,
        mentorAccent,
        originalScore: Number.isFinite(original) ? original : undefined,
        originalReasoning: originalReasoning || undefined,
        onComplete: (refined) => renderRefinedCard(refined, mentorName, mentorAccent, card),
      });
    });
  });
}

/** Draw a refined card below the original evaluation. */
function renderRefinedCard(
  refined: RefinedEvaluation,
  mentorName: string,
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

/** Render any refined cards on initial page load from localStorage. */
export function hydrateRefinedCards() {
  document.querySelectorAll<HTMLElement>("[data-clarify-trigger]").forEach((el) => {
    const ideaId = el.dataset.chatIdea || "";
    const mentor = el.dataset.chatMentor || "";
    const mentorName = el.dataset.chatMentorName || mentor;
    const mentorAccent = el.dataset.chatMentorAccent || "#666";
    const r = getRefined(ideaId, mentor);
    if (!r) return;
    const card = el.closest("article");
    renderRefinedCard(r, mentorName, mentorAccent, card);
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
