import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

export const getByUserId = query({
  args: { userId: v.string() },
  async handler(ctx, args) {
    return await ctx.db
      .query("workExperience")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const create = mutation({
  args: {
    userId: v.string(),
    companyName: v.string(),
    position: v.string(),
    description: v.string(),
    location: v.union(
      v.literal("remote"),
      v.literal("hybrid"),
      v.literal("onsite"),
    ),
    type: v.union(v.literal("contract"), v.literal("full-time")),
    timeline: v.object({ start: v.number(), end: v.optional(v.number()) }),
    logo: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) throw new ConvexError("Not authenticated");
    return await ctx.db.insert("workExperience", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("workExperience"),
    companyName: v.string(),
    position: v.string(),
    description: v.string(),
    location: v.union(
      v.literal("remote"),
      v.literal("hybrid"),
      v.literal("onsite"),
    ),
    type: v.union(v.literal("contract"), v.literal("full-time")),
    timeline: v.object({ start: v.number(), end: v.optional(v.number()) }),
  },
  async handler(ctx, args) {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) throw new ConvexError("Not authenticated");
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("workExperience") },
  async handler(ctx, args) {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) throw new ConvexError("Not authenticated");
    await ctx.db.delete(args.id);
  },
});
