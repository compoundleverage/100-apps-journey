/**
 * Seated mentors — visitor's local "bench" selection (up to MAX_SEATS).
 *
 * Single source of truth for which mentors appear in the visitor's panel,
 * group chat, and bench picker. Stored in localStorage under STORAGE_KEY.
 * SSR-safe: every function returns sensible defaults during server render.
 *
 * Builder changes DEFAULT_SEATED_SLUGS to set the initial roster for fresh
 * visitors. Visitors override via the /mentors picker UI.
 */

export const MAX_SEATS = 4;
export const STORAGE_KEY = "seated:v1";

// Builder's curated default 4. Edit here to change first-visit experience.
export const DEFAULT_SEATED_SLUGS: readonly string[] = [
  "pg",
  "naval",
  "karpathy",
  "steve-jobs",
];

const isBrowser = () => typeof window !== "undefined";

function readRaw(): string[] | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const cleaned = parsed.filter((x): x is string => typeof x === "string");
    return cleaned.slice(0, MAX_SEATS);
  } catch {
    return null;
  }
}

export function getSeatedSlugs(): string[] {
  const stored = readRaw();
  if (stored !== null) return stored;
  return [...DEFAULT_SEATED_SLUGS];
}

export function setSeatedSlugs(slugs: string[]): void {
  if (!isBrowser()) return;
  const seen = new Set<string>();
  const clean: string[] = [];
  for (const s of slugs) {
    if (typeof s !== "string" || seen.has(s)) continue;
    seen.add(s);
    clean.push(s);
    if (clean.length >= MAX_SEATS) break;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    window.dispatchEvent(new CustomEvent("seated:changed", { detail: clean }));
  } catch {
    /* quota / disabled storage — ignore */
  }
}

export function resetSeats(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent("seated:changed", { detail: [...DEFAULT_SEATED_SLUGS] }),
    );
  } catch {
    /* ignore */
  }
}

export function isSeated(slug: string): boolean {
  return getSeatedSlugs().includes(slug);
}

export function seatCount(): number {
  return getSeatedSlugs().length;
}

export function toggleSeat(slug: string): { ok: boolean; reason?: "full" } {
  const current = getSeatedSlugs();
  const idx = current.indexOf(slug);
  if (idx >= 0) {
    const next = [...current.slice(0, idx), ...current.slice(idx + 1)];
    setSeatedSlugs(next);
    return { ok: true };
  }
  if (current.length >= MAX_SEATS) return { ok: false, reason: "full" };
  setSeatedSlugs([...current, slug]);
  return { ok: true };
}

/**
 * Filter a catalog of items (each with a `slug`) to those in the seated set,
 * preserving the seated array's order. Unknown slugs in the seated array
 * are silently dropped — handles the case where a mentor was deleted after
 * being seated.
 */
export function filterSeated<T extends { slug: string }>(
  catalog: T[],
  seated: string[],
): T[] {
  const bySlug = new Map(catalog.map((m) => [m.slug, m]));
  const out: T[] = [];
  for (const slug of seated) {
    const item = bySlug.get(slug);
    if (item) out.push(item);
  }
  return out;
}
