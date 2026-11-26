const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

/** The readable title portion of a project slug is capped at this length. */
export const MAX_SLUG_KEBAB = 80;

/**
 * Kebab-case a project title: lowercase, collapse runs of non-alphanumerics
 * into one hyphen, trim the edges. All-non-Latin or empty titles fall back
 * to "project" — no transliteration.
 */
export function slugifyTitle(title: string): string {
  const kebab = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG_KEBAB)
    .replace(/-+$/g, "");

  return kebab || "project";
}

/**
 * 6-char [a-z0-9] suffix derived deterministically from the project doc id
 * (FNV-1a seed + xorshift mixing). Same id always yields the same suffix, so
 * a rename keeps the suffix while the title portion changes.
 */
export function projectIdSuffix(id: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }

  let suffix = "";
  for (let i = 0; i < 6; i++) {
    h = Math.imul(h ^ (h >>> 15), 0x2545f491) >>> 0;
    suffix += ALPHABET[h % ALPHABET.length];
  }

  return suffix;
}

/** `my-cool-app` + `x7k2p9` → `my-cool-app-x7k2p9`. */
export function projectSlug(id: string, title: string): string {
  return `${slugifyTitle(title)}-${projectIdSuffix(id)}`;
}
