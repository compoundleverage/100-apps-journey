import type { APIRoute } from "astro";
import { homeOg } from "../lib/og/template";
import { renderOg } from "../lib/og/render";

export const prerender = true;

export const GET: APIRoute = async () => {
  const png = await renderOg(homeOg());
  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
