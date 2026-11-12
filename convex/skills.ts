import { v } from "convex/values";
import { query } from "./_generated/server";

const DEFAULT_SUGGESTION_LIMIT = 8;
const MAX_SUGGESTION_LIMIT = 20;

export const listSkills = query({
  args: {},
  async handler(ctx) {
    return await ctx.db.query("skills").collect();
  },
});

export const searchSkills = query({
  args: {
    q: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { q, limit }): Promise<string[]> => {
    const term = q.trim();
    if (!term) return [];

    const count = Math.min(
      Math.max(limit ?? DEFAULT_SUGGESTION_LIMIT, 1),
      MAX_SUGGESTION_LIMIT,
    );

    const skills = await ctx.db
      .query("skills")
      .withSearchIndex("search_name", (search) => search.search("name", term))
      .take(count);

    return skills.map((skill) => skill.name);
  },
});
