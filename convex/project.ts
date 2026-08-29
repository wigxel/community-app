import {
  type PaginationResult,
  paginationOptsValidator,
  queryGeneric as query,
} from "convex/server";
import { v } from "convex/values";
import { Result } from "../lib/result";
import type { BasicProject, Project } from "../types/models";
import type { Doc } from "./_generated/dataModel";
import { mutation } from "./_generated/server";
import { authComponent } from "./auth";
import { project_schema } from "./schema";

function toProject(doc: Doc<"project">): Project {
  return doc as unknown as Project;
}

export const listProject = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args): Promise<PaginationResult<Project>> => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      console.error("Not authenticated");
      return { page: [], isDone: true, continueCursor: "" };
    }

    const result = await ctx.db
      .query("project")
      .withIndex("by_userId", (q) => q.eq("userId", authUser._id))
      .paginate(args.paginationOpts);

    return { ...result, page: result.page.map(toProject) };
  },
});

export const listProjectByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args): Promise<Project[]> => {
    const docs = await ctx.db
      .query("project")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    return docs.map(toProject);
  },
});

export const getProject = query({
  args: { id: v.nullable(v.string()) },
  handler: async (ctx, args) => {
    const doc: Doc<"project"> | null = await ctx.db
      .query("project")
      .filter((q) => q.eq(q.field("_id"), args.id))
      .first();

    if (doc === null) {
      return Result.error("Not found");
    }

    return Result.ok(toProject(doc));
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

export const listAll = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (
    ctx,
    { paginationOpts },
  ): Promise<PaginationResult<BasicProject>> => {
    const records = await ctx.db
      .query("project")
      .order("desc")
      .paginate({
        ...paginationOpts,
        numItems: Math.min(50, paginationOpts.numItems),
      });

    return {
      ...records,
      page: await Promise.all(
        records.page.map(async (project) => {
          const profile: Doc<"profile"> = await ctx.db.get(project.userId);

          return {
            ...project,
            username: profile?.username ?? "@anonymous",
            ownerName:
              `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim(),
          };
        }),
      ),
    };
  },
});
