import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";
import { mentorOg } from "../../../lib/og/template";
import { renderOg } from "../../../lib/og/render";

export const prerender = true;

export async function getStaticPaths() {
  const mentors = await getCollection("mentors");
  return mentors.map((mentor) => ({
    params: { slug: mentor.id },
    props: { mentor },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const mentor = (props as { mentor: CollectionEntry<"mentors"> }).mentor;
  const png = await renderOg(
    mentorOg({
      name: mentor.data.name,
      short_bio: mentor.data.short_bio,
      epitaph: mentor.data.epitaph,
      accent: mentor.data.accent,
      version: mentor.data.version,
      initials: mentor.data.avatar_initials,
    }),
  );
  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
