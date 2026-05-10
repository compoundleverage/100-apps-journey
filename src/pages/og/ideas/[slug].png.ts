import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";
import { ideaOg } from "../../../lib/og/template";
import { renderOg } from "../../../lib/og/render";

export const prerender = true;

export async function getStaticPaths() {
  const ideas = await getCollection("ideas");
  return ideas.map((idea) => ({
    params: { slug: idea.id },
    props: { idea },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const idea = (props as { idea: CollectionEntry<"ideas"> }).idea;
  const png = await renderOg(
    ideaOg({
      id: idea.data.id,
      title: idea.data.title,
      thesis: idea.data.thesis,
      status: idea.data.status,
    }),
  );
  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
