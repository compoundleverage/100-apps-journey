/**
 * Browser fetch wrapper that POSTs to a chat endpoint and yields NDJSON
 * stream events. Caller drives the UI append per delta.
 */

import type { ChatMessage, StreamEvent } from "./types";

export interface StreamOpts {
  endpoint: string;
  apiKey: string;
  ideaId: string;
  mentor?: string;
  history: ChatMessage[];
  /** Extra mode-specific payload (e.g. { dimensions: [...] } for clarify). */
  extras?: Record<string, unknown>;
  signal?: AbortSignal;
}

/**
 * Async iterator: yields one StreamEvent per server NDJSON line.
 *
 * Usage:
 *   for await (const ev of streamChat({...})) {
 *     if (ev.type === "delta") appendText(ev.text);
 *     else if (ev.type === "done") finalize(ev);
 *     else if (ev.type === "error") showError(ev.message);
 *   }
 */
export async function* streamChat(opts: StreamOpts): AsyncGenerator<StreamEvent> {
  const res = await fetch(opts.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-Anthropic-Key": opts.apiKey,
    },
    body: JSON.stringify({
      ideaId: opts.ideaId,
      mentor: opts.mentor,
      history: opts.history,
      ...opts.extras,
    }),
    signal: opts.signal,
  });

  if (!res.ok || !res.body) {
    let msg = `HTTP ${res.status}`;
    try {
      const text = await res.text();
      if (text) msg = `${msg}: ${text.slice(0, 300)}`;
    } catch {
      /* ignore */
    }
    yield { type: "error", message: msg };
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line) continue;
      try {
        yield JSON.parse(line) as StreamEvent;
      } catch {
        // partial line — skip; remainder will accumulate next read
      }
    }
  }

  // flush any tail
  if (buffer.trim()) {
    try {
      yield JSON.parse(buffer.trim()) as StreamEvent;
    } catch {
      /* ignore */
    }
  }
}

/** One-shot key-validity check: trivial Anthropic ping. */
export async function testApiKey(key: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("/api/chat/test-key", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-User-Anthropic-Key": key },
    });
    if (res.ok) return { ok: true };
    const text = await res.text();
    return { ok: false, error: text || `HTTP ${res.status}` };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
