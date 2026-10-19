export const MAX_PROJECT_TAGS = 8;
export const MAX_TAG_LENGTH = 32;

export function normalizeTag(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

export function hasTag(tags: readonly string[], candidate: string): boolean {
  const needle = candidate.toLowerCase();
  return tags.some((tag) => tag.toLowerCase() === needle);
}

export function normalizeTags(raw: readonly string[]): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];

  for (const value of raw) {
    const tag = normalizeTag(value);
    if (!tag) continue;

    const key = tag.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    tags.push(tag);
  }

  return tags;
}
