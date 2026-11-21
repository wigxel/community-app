/**
 * Long-form project descriptions are stored as raw Markdown in a separate
 * `projectDescription` Convex table, keyed by `projectId`. The short
 * `project.description` stays capped at 300 chars for cards/SEO.
 */
export const MAX_PROJECT_DESCRIPTION_WORDS = 5000;

export function countWords(text: string): number {
  const words = text.trim();
  if (words === "") return 0;
  return words.split(/\s+/).length;
}
