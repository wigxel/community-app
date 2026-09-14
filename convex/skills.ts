import { queryGeneric as query } from "convex/server";

// Query to list skills
export const listSkills = query({
  args: {},
  async handler(ctx) {
    return await ctx.db.query("skills").collect();
  },
});
