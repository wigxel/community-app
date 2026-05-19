import { queryGeneric as query } from "convex/server";
import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { authComponent } from "./auth";
import { project_schema } from "./schema";

export const listProject = query({
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) throw new Error("Not authenticated");

    return await ctx.db
      .query("project")
      .withIndex("by_userId", (q) => q.eq("userId", authUser._id))
      .collect();
  },
});

export const listProjectByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("project")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const createProject = mutation({
  args: {
    project: v.object(project_schema),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) throw new Error("Not authenticated");

    await ctx.db.insert("project", {
      ...args.project,
      userId: authUser._id,
    });
  },
});

export const updateProject = mutation({
  args: {
    project: v.object({
      ...project_schema,
      _id: v.optional(v.id("project")),
    }),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) throw new Error("Not authenticated");

    const { _id, ...projectData } = args.project;

    if (projectData.userId && projectData.userId !== authUser._id)
      throw new Error("Unauthorized action");

    const existingProject = _id ? await ctx.db.get(_id) : null;
    if (!existingProject) throw new Error("Project not found");

    await ctx.db.patch(existingProject._id, projectData);
  },
});

export const deleteProject = mutation({
  args: {
    _id: v.id("project"),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) throw new Error("Not authenticated");

    const existingProject = await ctx.db.get(args._id);
    if (!existingProject) return;

    if (existingProject.userId !== authUser._id)
      throw new Error("Unauthorized action");

    await ctx.db.delete(existingProject._id);
  },
});
