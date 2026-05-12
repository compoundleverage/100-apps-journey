/**
 * Client-side controller for the global ChatDrawer instance.
 *
 * Pattern: ONE drawer in the DOM (rendered by Layout.astro). Any element with
 * `data-chat-trigger` opens it, with mode/idea/mentor read off data attrs.
 *
 *   <button data-chat-trigger
 *           data-chat-mode="1on1"
 *           data-chat-idea="001-100-apps-journey"
 *           data-chat-mentor="steve-jobs">Talk to Steve Jobs →</button>
 *
 *   <button data-chat-trigger
 *           data-chat-mode="group"
 *           data-chat-idea="001-100-apps-journey">Open panel discussion →</button>
 */

import { streamChat } from "./client";
import {
  appendMessage,
  clearSession,
  getApiKey,
  hasApiKey,
  loadSession,
  sessionId,
} from "./storage";
import type { ChatMessage, ChatMode } from "./types";
import { getLang, STRINGS } from "../i18n";
import { attachRefinedCard } from "./clarify";
import { getSeatedSlugs, filterSeated } from "../seated";

interface MentorMeta {
  slug: string;
  name: string;
  avatar_initials: string;
  accent: string;
}

interface DrawerOpenArgs {
  mode: ChatMode;
  ideaId: string;
  mentor?: string; // required for 1on1
  mentorMeta?: MentorMeta; // for header rendering
  groupMentors?: MentorMeta[]; // for group rail
}

export class ChatDrawerController {
  private root: HTMLElement;
  private subtitleEl: HTMLElement;
  private threadEl: HTMLElement;
  private composerEl: HTMLTextAreaElement;
  private sendBtn: HTMLButtonElement;
  private closeBtn: HTMLElement;
  private clearBtn: HTMLElement;
  private rail: HTMLElement;
  private accentBar: HTMLElement;

  private current: DrawerOpenArgs | null = null;
  private inFlight = false;
  private abortCtl: AbortController | null = null;

  private modal: HTMLElement;
  private modalDismiss: HTMLElement;

  private rescoreRow: HTMLElement;
  private rescoreBtn: HTMLButtonElement;
  private rescoreStatus: HTMLElement;
  private rescoreInFlight = false;

  private s = STRINGS[getLang(new URL(window.location.href))];

  constructor() {
    this.root = document.getElementById("chat-drawer")!;
    this.subtitleEl = document.getElementById("chat-drawer-subtitle")!;
    this.threadEl = document.getElementById("chat-thread")!;
    this.composerEl = document.getElementById("chat-composer") as HTMLTextAreaElement;
    this.sendBtn = document.getElementById("chat-send") as HTMLButtonElement;
    this.closeBtn = document.getElementById("chat-close")!;
    this.clearBtn = document.getElementById("chat-clear")!;
    this.rail = document.getElementById("chat-mentor-rail")!;
    this.accentBar = document.getElementById("chat-accent-bar")!;

    this.modal = document.getElementById("api-key-modal")!;
    this.modalDismiss = document.getElementById("api-key-modal-dismiss")!;

    this.rescoreRow = document.getElementById("chat-rescore-row")!;
    this.rescoreBtn = document.getElementById("chat-rescore") as HTMLButtonElement;
    this.rescoreStatus = document.getElementById("chat-rescore-status")!;

    this.bind();
  }

  private bind() {
    this.closeBtn.addEventListener("click", () => this.close());
    this.clearBtn.addEventListener("click", () => this.clearHistory());
    this.modalDismiss.addEventListener("click", () => this.hideKeyModal());

    this.sendBtn.addEventListener("click", () => this.send());
    this.composerEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.send();
      }
    });
    this.rescoreBtn.addEventListener("click", () => this.rescore());

    // Bind all triggers on the page.
    document.querySelectorAll<HTMLElement>("[data-chat-trigger]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        this.openFromTrigger(el);
      });
    });

    // Esc to close drawer.
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen()) this.close();
    });
  }

  private openFromTrigger(el: HTMLElement) {
    if (!hasApiKey()) {
      this.showKeyModal();
      return;
    }
    const mode = (el.dataset.chatMode || "1on1") as ChatMode;
    const ideaId = el.dataset.chatIdea || "";
    const mentor = el.dataset.chatMentor;

    let mentorMeta: MentorMeta | undefined;
    if (mentor) {
      mentorMeta = {
        slug: mentor,
        name: el.dataset.chatMentorName || mentor,
        avatar_initials: el.dataset.chatMentorInitials || mentor.slice(0, 2).toUpperCase(),
        accent: el.dataset.chatMentorAccent || "#666",
      };
    }
    let groupMentors: MentorMeta[] | undefined;
    const groupRoster = el.dataset.chatGroupRoster;
    if (groupRoster) {
      try {
        groupMentors = JSON.parse(groupRoster);
      } catch {
        /* ignore */
      }
    }
    // Group mode: filter the catalog roster down to the visitor's seated set.
    // Fall back to full roster if nothing seated (avoids empty panel deadlock).
    if (mode === "group" && groupMentors && groupMentors.length > 0) {
      const seated = getSeatedSlugs();
      const filtered = filterSeated(groupMentors, seated);
      if (filtered.length > 0) groupMentors = filtered;
      else console.warn("[chat] no seated mentors found, opening with full catalog");
    }
    this.open({ mode, ideaId, mentor, mentorMeta, groupMentors });
  }

  open(args: DrawerOpenArgs) {
    this.current = args;
    // Header
    if (args.mode === "1on1" && args.mentorMeta) {
      this.subtitleEl.textContent = this.s.chat_drawer_subtitle_1on1(args.mentorMeta.name);
      this.accentBar.style.background = args.mentorMeta.accent;
    } else if (args.mode === "group") {
      this.subtitleEl.textContent = this.s.chat_drawer_subtitle_group;
      this.accentBar.style.background = "var(--color-seal)";
    }
    // Mentor rail (group only)
    if (args.mode === "group" && args.groupMentors) {
      this.rail.innerHTML = args.groupMentors
        .map(
          (m) => `
        <span class="inline-flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-mono"
          style="background-color: color-mix(in oklch, ${m.accent} 14%, transparent); color: ${m.accent};"
          title="${m.name}"
          data-mentor-slug="${m.slug}">
          ${m.avatar_initials}
        </span>`,
        )
        .join("");
      this.rail.classList.remove("hidden");
    } else {
      this.rail.classList.add("hidden");
      this.rail.innerHTML = "";
    }
    // Render history
    this.renderThread();
    // Rescore row: only meaningful for 1-on-1 (group has multiple speakers
    // so "let THIS mentor re-score" doesn't apply).
    if (args.mode === "1on1") {
      this.rescoreRow.classList.remove("hidden");
      this.rescoreRow.classList.add("flex");
    } else {
      this.rescoreRow.classList.add("hidden");
      this.rescoreRow.classList.remove("flex");
    }
    this.refreshRescoreState();
    // Show
    this.root.classList.remove("translate-x-full");
    this.root.classList.add("translate-x-0");
    this.root.setAttribute("aria-hidden", "false");
    document.body.classList.add("overflow-hidden");
    setTimeout(() => this.composerEl.focus(), 200);
  }

  /** Enable rescore button only when there's at least one mentor turn in
   *  the session — re-scoring with no conversation has nothing to anchor on. */
  private refreshRescoreState() {
    if (!this.current || this.current.mode !== "1on1") {
      this.rescoreBtn.disabled = true;
      return;
    }
    const id = this.currentSessionId();
    if (!id) {
      this.rescoreBtn.disabled = true;
      return;
    }
    const session = loadSession(id);
    const hasMentorTurn = !!session?.messages.some((m) => m.role === "mentor");
    this.rescoreBtn.disabled = !hasMentorTurn || this.rescoreInFlight;
  }

  close() {
    this.abortCtl?.abort();
    this.root.classList.remove("translate-x-0");
    this.root.classList.add("translate-x-full");
    this.root.setAttribute("aria-hidden", "true");
    document.body.classList.remove("overflow-hidden");
    this.current = null;
  }

  isOpen() {
    return this.root.getAttribute("aria-hidden") === "false";
  }

  private currentSessionId(): string | null {
    if (!this.current) return null;
    return sessionId(this.current.mode, this.current.ideaId, this.current.mentor);
  }

  private renderThread() {
    const id = this.currentSessionId();
    if (!id) return;
    const session = loadSession(id);
    const messages = session?.messages ?? [];
    if (messages.length === 0) {
      const empty =
        this.current?.mode === "group"
          ? this.s.chat_empty_group
          : this.s.chat_empty_1on1(this.current?.mentorMeta?.name ?? "");
      this.threadEl.innerHTML = `
        <div class="font-body italic text-sm text-ink-soft text-center py-12 px-4 leading-relaxed">
          ${escapeHtml(empty)}
        </div>`;
      return;
    }
    this.threadEl.innerHTML = messages
      .map((m) => this.renderMessageHTML(m))
      .join("");
    this.threadEl.scrollTop = this.threadEl.scrollHeight;
  }

  private renderMessageHTML(m: ChatMessage): string {
    if (m.role === "user") {
      return `
        <div class="px-5 py-4 border-b border-rule">
          <p class="font-mono text-[9px] uppercase tracking-[0.22em] text-ink-soft mb-1.5">${escapeHtml(this.s.chat_role_you)}</p>
          <p class="font-body text-[15px] text-ink leading-snug whitespace-pre-wrap">${escapeHtml(m.text)}</p>
        </div>`;
    }
    const meta = this.lookupMentorMeta(m.mentor);
    const accent = meta?.accent ?? "#666";
    const name = meta?.name ?? m.mentor ?? "Mentor";
    const initials = meta?.avatar_initials ?? "??";
    return `
      <div class="px-5 py-4 border-b border-rule" style="background: color-mix(in oklch, ${accent} 4%, transparent);">
        <div class="flex items-baseline gap-2 mb-2">
          <span class="inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-mono shrink-0" style="background-color: color-mix(in oklch, ${accent} 14%, transparent); color: ${accent};">${escapeHtml(initials)}</span>
          <span class="font-display font-semibold text-sm text-ink">${escapeHtml(name)}</span>
        </div>
        <p class="font-body text-[15px] text-ink leading-relaxed whitespace-pre-wrap">${escapeHtml(m.text)}</p>
      </div>`;
  }

  private lookupMentorMeta(slug: string | undefined): MentorMeta | undefined {
    if (!slug) return undefined;
    if (this.current?.mode === "1on1" && this.current.mentor === slug) return this.current.mentorMeta;
    if (this.current?.mode === "group" && this.current.groupMentors) {
      return this.current.groupMentors.find((m) => m.slug === slug);
    }
    return undefined;
  }

  private async send() {
    if (this.inFlight || !this.current) return;
    const apiKey = getApiKey();
    if (!apiKey) {
      this.showKeyModal();
      return;
    }
    const text = this.composerEl.value.trim();
    // Empty user input is OK on the very first turn (lets mentor open)
    const id = this.currentSessionId();
    if (!id) return;
    const existing = loadSession(id);
    const isOpening = !existing || existing.messages.length === 0;

    if (text) {
      const userMsg: ChatMessage = { role: "user", text, ts: new Date().toISOString() };
      appendMessage(id, userMsg);
      this.composerEl.value = "";
      this.appendMessageDOM(userMsg);
    } else if (!isOpening) {
      // mid-conversation requires user input
      return;
    }

    // Stub message for streaming append
    const stubMentor = this.current.mode === "1on1" ? this.current.mentor : undefined;
    const stub: ChatMessage = { role: "mentor", mentor: stubMentor, text: "", ts: new Date().toISOString() };
    const stubEl = this.appendMessageDOM(stub, /* asStub */ true);
    const textEl = stubEl.querySelector(".chat-stream-target") as HTMLElement;

    this.inFlight = true;
    this.sendBtn.disabled = true;
    this.sendBtn.textContent = this.s.chat_thinking;
    this.abortCtl = new AbortController();

    let buffer = "";
    let currentStub: HTMLElement | null = stubEl;
    let currentTextEl: HTMLElement | null = textEl;
    /** True once we've shown SOMETHING (delta text or an error) — prevents
     *  the cleanup pass from yanking the stub away when the user actually
     *  needs to see what happened. */
    let hadVisibleContent = false;
    try {
      const endpoint =
        this.current.mode === "1on1"
          ? `/api/chat/1on1/${this.current.mentor}`
          : `/api/chat/group/${this.current.ideaId}`;
      const history = loadSession(id)?.messages ?? [];
      // Group mode: tell the server which mentors are seated so it only
      // streams turns from them. 1on1 doesn't need this (slug is in URL).
      const extras =
        this.current.mode === "group" && this.current.groupMentors
          ? { mentors: this.current.groupMentors.map((m) => m.slug) }
          : undefined;
      console.log("[chat] sending", { endpoint, historyLen: history.length, extras });

      // For group: server may emit multiple `done` events with `speaker`
      // (one per mentor in the opening pass). Each one commits the current
      // buffer + opens a fresh stub for the next mentor's deltas.
      for await (const ev of streamChat({
        endpoint,
        apiKey,
        ideaId: this.current.ideaId,
        mentor: this.current.mentor,
        history,
        extras,
        signal: this.abortCtl.signal,
      })) {
        if (ev.type === "delta") {
          if (!currentStub) {
            // A new mentor turn started after a prior `done speaker` committed.
            const fresh: ChatMessage = {
              role: "mentor",
              mentor: undefined,
              text: "",
              ts: new Date().toISOString(),
            };
            currentStub = this.appendMessageDOM(fresh, true);
            currentTextEl = currentStub.querySelector(".chat-stream-target") as HTMLElement;
          }
          if (!ev.text) continue; // server flush sentinel
          buffer += ev.text;
          hadVisibleContent = true;
          if (currentTextEl) currentTextEl.textContent = buffer;
          this.threadEl.scrollTop = this.threadEl.scrollHeight;
        } else if (ev.type === "done") {
          if (ev.speaker) {
            // Attribute current stub to the named speaker, persist message.
            if (currentStub) this.attributeStubToMentor(currentStub, ev.speaker);
            if (buffer.trim()) {
              const finalMsg: ChatMessage = {
                role: "mentor",
                mentor: ev.speaker,
                text: buffer,
                ts: new Date().toISOString(),
              };
              appendMessage(id, finalMsg);
            }
            // Reset for the next mentor (group opening pass continues)
            buffer = "";
            currentStub = null;
            currentTextEl = null;
          } else {
            // Final close marker for this turn / pass
            if (buffer.trim() && stubMentor) {
              // 1-on-1: attribute to the mentor we asked
              const finalMsg: ChatMessage = {
                role: "mentor",
                mentor: stubMentor,
                text: buffer,
                ts: new Date().toISOString(),
              };
              appendMessage(id, finalMsg);
            }
          }
        } else if (ev.type === "error") {
          // Render the error inline in the current stub AND mark it visible
          // so the cleanup pass below doesn't remove it.
          hadVisibleContent = true;
          console.error("[chat] server error event:", ev.message);
          if (!currentStub) {
            // Group case: error before any delta of a fresh turn — make a
            // dedicated error stub so it can't get lost.
            const fresh: ChatMessage = {
              role: "mentor",
              mentor: stubMentor,
              text: "",
              ts: new Date().toISOString(),
            };
            currentStub = this.appendMessageDOM(fresh, true);
            currentTextEl = currentStub.querySelector(".chat-stream-target") as HTMLElement;
          }
          if (currentTextEl) {
            currentTextEl.textContent = `${this.s.chat_error_prefix}${ev.message}`;
            currentTextEl.style.color = "var(--color-killed)";
          }
        }
      }
      // Only remove the stub if NOTHING got rendered into it (orphan stub
      // from a server stream that closed without sending anything).
      if (currentStub && !hadVisibleContent) {
        console.warn("[chat] stream closed with no content — removing orphan stub");
        currentStub.remove();
        // Surface a generic error in the thread so the user knows something
        // went wrong instead of seeing the empty placeholder reappear.
        const errEl = document.createElement("div");
        errEl.className = "px-5 py-4 border-b border-rule";
        errEl.innerHTML = `<p class="font-body text-sm" style="color: var(--color-killed);">${escapeHtml(
          this.s.chat_error_prefix,
        )}stream closed with no response from server (check console + your API key)</p>`;
        this.threadEl.appendChild(errEl);
      }
    } catch (e) {
      console.error("[chat] send threw:", e);
      if (currentTextEl) {
        currentTextEl.textContent = `${this.s.chat_error_prefix}${String(e)}`;
        currentTextEl.style.color = "var(--color-killed)";
      } else {
        const errEl = document.createElement("div");
        errEl.className = "px-5 py-4 border-b border-rule";
        errEl.innerHTML = `<p class="font-body text-sm" style="color: var(--color-killed);">${escapeHtml(
          this.s.chat_error_prefix,
        )}${escapeHtml(String(e))}</p>`;
        this.threadEl.appendChild(errEl);
      }
    } finally {
      this.inFlight = false;
      this.sendBtn.disabled = false;
      this.sendBtn.textContent = this.s.chat_send;
      this.abortCtl = null;
      this.refreshRescoreState();
    }
  }

  /** "Ask for fresh score" — sends current chat history + original score
   *  to /api/chat/clarify/<mentor>, attaches the refined card on the
   *  underlying page when the response lands. */
  private async rescore() {
    if (this.rescoreInFlight || !this.current) return;
    if (this.current.mode !== "1on1" || !this.current.mentor || !this.current.mentorMeta) return;

    const apiKey = getApiKey();
    if (!apiKey) {
      this.showKeyModal();
      return;
    }
    const id = this.currentSessionId();
    if (!id) return;
    const session = loadSession(id);
    const history = session?.messages ?? [];
    if (!history.some((m) => m.role === "mentor")) {
      this.rescoreStatus.textContent = this.s.rescore_btn_disabled_hint;
      this.rescoreStatus.style.color = "var(--color-ink-soft)";
      return;
    }

    // Pull the original score+reasoning off the underlying page so the
    // mentor has the prior anchor in their rescore prompt.
    let original: { score: number; reasoning: string } | undefined;
    const trigger = document.querySelector<HTMLElement>(
      `[data-chat-trigger][data-chat-mode="1on1"][data-chat-mentor="${this.current.mentor}"]`,
    );
    const card = trigger?.closest("article");
    if (card) {
      const scoreEl = card.querySelector(".font-display[style*='color']");
      const rawScore = scoreEl?.textContent?.trim();
      const score = rawScore ? parseInt(rawScore, 10) : NaN;
      const reasoningEl = card.querySelector("p.font-body.text-\\[13\\.5px\\]");
      const reasoning = reasoningEl?.textContent?.trim() ?? "";
      if (Number.isFinite(score) && reasoning) {
        original = { score, reasoning };
      }
    }

    this.rescoreInFlight = true;
    this.rescoreBtn.disabled = true;
    this.rescoreStatus.style.color = "var(--color-ink-soft)";
    this.rescoreStatus.textContent = this.s.rescore_loading;

    try {
      const res = await fetch(`/api/chat/clarify/${this.current.mentor}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-User-Anthropic-Key": apiKey },
        body: JSON.stringify({ ideaId: this.current.ideaId, history, original }),
      });
      if (!res.ok) {
        const text = (await res.text()) || `HTTP ${res.status}`;
        throw new Error(text.slice(0, 300));
      }
      const refined = (await res.json()) as {
        score: number;
        reasoning: string;
        dimensions?: Array<{ name: string; verdict: "pass" | "fail" | "unclear"; note: string }>;
        refined_at: string;
      };
      const accent = this.current.mentorMeta.accent;
      attachRefinedCard(
        { ...refined, mentor: this.current.mentor, ideaId: this.current.ideaId },
        accent,
      );
      const delta = original ? refined.score - original.score : 0;
      this.rescoreStatus.style.color = "var(--color-seal)";
      this.rescoreStatus.textContent = this.s.rescore_done(delta);
    } catch (e) {
      console.error("[chat] rescore failed:", e);
      this.rescoreStatus.style.color = "var(--color-killed)";
      this.rescoreStatus.textContent = this.s.rescore_failed(String(e));
    } finally {
      this.rescoreInFlight = false;
      this.refreshRescoreState();
    }
  }

  private attributeStubToMentor(stubEl: HTMLElement, slug: string) {
    const meta = this.lookupMentorMeta(slug);
    if (!meta) return;
    // Update header inside this stub
    const accent = meta.accent;
    stubEl.style.background = `color-mix(in oklch, ${accent} 4%, transparent)`;
    const head = stubEl.querySelector(".chat-mentor-head");
    if (head) {
      head.innerHTML = `
        <span class="inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-mono shrink-0" style="background-color: color-mix(in oklch, ${accent} 14%, transparent); color: ${accent};">${escapeHtml(meta.avatar_initials)}</span>
        <span class="font-display font-semibold text-sm text-ink">${escapeHtml(meta.name)}</span>`;
    }
  }

  private appendMessageDOM(m: ChatMessage, asStub = false): HTMLElement {
    // If thread is currently the empty placeholder, clear it
    if (this.threadEl.querySelector(".chat-empty-placeholder, .text-center")) {
      this.threadEl.innerHTML = "";
    }
    const el = document.createElement("div");
    if (m.role === "user") {
      el.className = "px-5 py-4 border-b border-rule";
      el.innerHTML = `
        <p class="font-mono text-[9px] uppercase tracking-[0.22em] text-ink-soft mb-1.5">${escapeHtml(this.s.chat_role_you)}</p>
        <p class="font-body text-[15px] text-ink leading-snug whitespace-pre-wrap">${escapeHtml(m.text)}</p>`;
    } else {
      const meta = this.lookupMentorMeta(m.mentor);
      const accent = meta?.accent ?? "#666";
      const name = meta?.name ?? (asStub ? this.s.chat_thinking : m.mentor ?? "Mentor");
      const initials = meta?.avatar_initials ?? (asStub ? "··" : "??");
      el.className = "px-5 py-4 border-b border-rule";
      el.style.background = `color-mix(in oklch, ${accent} 4%, transparent)`;
      el.innerHTML = `
        <div class="chat-mentor-head flex items-baseline gap-2 mb-2">
          <span class="inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-mono shrink-0" style="background-color: color-mix(in oklch, ${accent} 14%, transparent); color: ${accent};">${escapeHtml(initials)}</span>
          <span class="font-display font-semibold text-sm text-ink">${escapeHtml(name)}</span>
        </div>
        <p class="font-body text-[15px] text-ink leading-relaxed whitespace-pre-wrap chat-stream-target">${escapeHtml(m.text)}</p>`;
    }
    this.threadEl.appendChild(el);
    this.threadEl.scrollTop = this.threadEl.scrollHeight;
    return el;
  }

  private clearHistory() {
    if (!this.current) return;
    if (!confirm(this.s.chat_clear_confirm)) return;
    const id = this.currentSessionId();
    if (!id) return;
    clearSession(id);
    this.renderThread();
    this.rescoreStatus.textContent = "";
    this.refreshRescoreState();
  }

  private showKeyModal() {
    this.modal.classList.remove("hidden");
  }
  private hideKeyModal() {
    this.modal.classList.add("hidden");
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

let _instance: ChatDrawerController | null = null;
export function ensureChatDrawer(): ChatDrawerController {
  if (!_instance) _instance = new ChatDrawerController();
  return _instance;
}
