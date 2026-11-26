import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Read a project's long-form Markdown description.
 * Returns null for legacy projects (no row stored).
 */
export const getProjectDescription = query({
  args: { projectId: v.id("project") },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("projectDescription")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .first();

    return row?.markdown ?? null;
  },
});
