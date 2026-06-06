import { queryGeneric as query } from "convex/server";

// Query to list titles
export const listTitles = query({
  args: {},
  async handler(ctx) {
    return await ctx.db.query("titles").collect();
  },
});
