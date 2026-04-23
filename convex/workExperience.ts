import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    userId: v.id("users"),
    logo: v.optional(v.string()),
    companyName: v.string(),
    location: v.union(
      v.literal("remote"),
      v.literal("hybrid"),
      v.literal("onsite"),
    ),
    type: v.union(v.literal("contract"), v.literal("full-time")),
    timeline: v.object({
      start: v.number(),
      end: v.optional(v.number()),
    }),
    description: v.string(),
    position: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("workExperience", {
      ...args,
      logo: args.logo ?? "",
    });
  },
});

export const getByUserId = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("workExperience")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const update = mutation({
  args: {
    id: v.id("workExperience"),
    logo: v.optional(v.string()),
    companyName: v.string(),
    location: v.union(
      v.literal("remote"),
      v.literal("hybrid"),
      v.literal("onsite"),
    ),
    type: v.union(v.literal("contract"), v.literal("full-time")),
    timeline: v.object({
      start: v.number(),
      end: v.optional(v.number()),
    }),
    description: v.string(),
    position: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;

    await ctx.db.patch(id, {
      ...rest,
      logo: rest.logo ?? "",
    });

    return id;
  },
});

export const remove = mutation({
  args: {
    id: v.id("workExperience"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});
