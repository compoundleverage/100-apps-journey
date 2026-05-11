/**
 * Chat type contracts shared between server endpoints and client.
 *
 * Wire format on the streaming response (NDJSON, one JSON object per line):
 *   { "type": "delta", "text": "..." }   incremental token chunk
 *   { "type": "done", "usage": {...} }   final marker, optional usage stats
 *   { "type": "error", "message": "..." } terminal error
 */

export type ChatRole = "user" | "mentor";

export interface ChatMessage {
  role: ChatRole;
  /** mentor slug if role is "mentor", undefined for user */
  mentor?: string;
  /** plain text body */
  text: string;
  /** ISO timestamp */
  ts: string;
}

export type ChatMode = "1on1" | "clarify" | "group";

export interface ChatSession {
  /** "<mode>:<ideaId>:<mentorOrGroup>" — unique storage key */
  id: string;
  mode: ChatMode;
  ideaId: string;
  mentor?: string; // undefined for group
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface StreamDelta {
  type: "delta";
  text: string;
}

export interface StreamDone {
  type: "done";
  /** Anthropic usage if available */
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    cache_read_input_tokens?: number;
    cache_creation_input_tokens?: number;
  };
  /** For clarify: refined evaluation payload */
  refined?: {
    score: number;
    reasoning: string;
    dimensions?: Array<{ name: string; verdict: "pass" | "fail" | "unclear"; note: string }>;
  };
  /** For group: which mentor spoke this turn, plus orchestrator hint for next */
  speaker?: string;
  next_mentor?: string;
}

export interface StreamError {
  type: "error";
  message: string;
}

export type StreamEvent = StreamDelta | StreamDone | StreamError;
