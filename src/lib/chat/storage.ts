/**
 * Browser-only localStorage helpers for BYOK API key + chat sessions.
 *
 * All functions return safe defaults during SSR (typeof window === "undefined")
 * so they're safe to call from Astro components rendered on the server.
 */

import type { ChatMessage, ChatMode, ChatSession } from "./types";

const KEY_API = "anthropicApiKey";
const KEY_CHAT_PREFIX = "chat:";

const isBrowser = () => typeof window !== "undefined";

// --- API key ---------------------------------------------------------

export function getApiKey(): string | null {
  if (!isBrowser()) return null;
  try {
    return localStorage.getItem(KEY_API);
  } catch {
    return null;
  }
}

export function setApiKey(key: string): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(KEY_API, key);
  } catch {
    /* ignore */
  }
}

export function clearApiKey(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(KEY_API);
  } catch {
    /* ignore */
  }
}

export function hasApiKey(): boolean {
  return Boolean(getApiKey());
}

/** Light shape check — sk-ant-... — caller still gates on a server "Test key" round trip. */
export function looksLikeApiKey(s: string): boolean {
  return /^sk-ant-[\w-]{20,}$/.test(s.trim());
}

// --- Chat sessions ---------------------------------------------------

export function sessionId(mode: ChatMode, ideaId: string, mentor?: string): string {
  return `${KEY_CHAT_PREFIX}${mode}:${ideaId}:${mentor ?? "group"}`;
}

export function loadSession(id: string): ChatSession | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(id);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ChatSession;
    if (!parsed || !Array.isArray(parsed.messages)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveSession(session: ChatSession): void {
  if (!isBrowser()) return;
  try {
    session.updatedAt = new Date().toISOString();
    localStorage.setItem(session.id, JSON.stringify(session));
  } catch {
    /* ignore — quota or eval errors */
  }
}

export function appendMessage(id: string, msg: ChatMessage): ChatSession | null {
  const existing = loadSession(id);
  const now = new Date().toISOString();
  const session: ChatSession =
    existing ??
    {
      id,
      mode: id.split(":")[1] as ChatMode,
      ideaId: id.split(":")[2] ?? "",
      mentor: id.split(":")[3] === "group" ? undefined : id.split(":")[3],
      messages: [],
      createdAt: now,
      updatedAt: now,
    };
  session.messages.push(msg);
  saveSession(session);
  return session;
}

export function clearSession(id: string): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(id);
  } catch {
    /* ignore */
  }
}

export function listSessionsForIdea(ideaId: string): ChatSession[] {
  if (!isBrowser()) return [];
  const out: ChatSession[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(KEY_CHAT_PREFIX)) continue;
      const parts = k.split(":");
      if (parts[2] !== ideaId) continue;
      const s = loadSession(k);
      if (s) out.push(s);
    }
  } catch {
    /* ignore */
  }
  return out.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
