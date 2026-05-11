import type { APIRoute } from "astro";
import Anthropic from "@anthropic-ai/sdk";

export const prerender = false;

/**
 * BYOK key validation. POSTs the user's key in `X-User-Anthropic-Key`,
 * we do a 1-token Anthropic round-trip, return ok or error string.
 * Key is never logged or persisted server-side.
 */
export const POST: APIRoute = async ({ request }) => {
  const key = request.headers.get("x-user-anthropic-key")?.trim();
  if (!key || !key.startsWith("sk-ant-")) {
    return new Response("Missing or malformed key (expected sk-ant-...)", { status: 400 });
  }

  try {
    const client = new Anthropic({ apiKey: key });
    // Minimal ping: 1 token, cheapest model.
    await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1,
      messages: [{ role: "user", content: "hi" }],
    });
    return new Response("ok", { status: 200 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    // Strip key from any error message defensively.
    return new Response(msg.replace(key, "<redacted>"), { status: 401 });
  }
};
