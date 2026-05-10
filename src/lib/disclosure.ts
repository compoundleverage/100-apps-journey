import type { CollectionEntry } from "astro:content";

export type DisclosureLevel = "full" | "thesis" | "title";

type IdeaData = CollectionEntry<"ideas">["data"];

/**
 * Compute the effective disclosure level for an idea.
 *
 * Rules:
 * - In dev (`bun run dev`), always return "full" — local user is the author.
 * - Manual override (anything other than "auto") wins.
 * - Auto mode maps status → disclosure:
 *    idea       → title
 *    building   → thesis
 *    shipped    → full
 *    killed     → full
 */
export function effectiveDisclosure(
  data: Pick<IdeaData, "status" | "disclosure">,
): DisclosureLevel {
  // Local dev shows everything to the author.
  // import.meta.env.DEV is true under `astro dev`, false under `astro build`.
  if (import.meta.env.DEV) return "full";

  if (data.disclosure !== "auto") return data.disclosure;

  switch (data.status) {
    case "idea":
      return "title";
    case "building":
      return "thesis";
    case "shipped":
    case "killed":
      return "full";
    default:
      return "title";
  }
}

export function showThesis(level: DisclosureLevel): boolean {
  return level === "full" || level === "thesis";
}

export function showBody(level: DisclosureLevel): boolean {
  return level === "full";
}

export function showPanel(level: DisclosureLevel): boolean {
  // Panel evaluations reveal thesis-adjacent thinking; only show at full.
  return level === "full";
}
