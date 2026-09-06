import {
  type PaginationResult,
  paginationOptsValidator,
  queryGeneric as query,
} from "convex/server";
import { v } from "convex/values";
import { Either } from "effect";
import { Result, type ResultShape } from "../lib/result";
import type { BasicProject, Project } from "../types/models";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation } from "./_generated/server";
import { authComponent } from "./auth";
import { project_schema } from "./schema";

const MONTHS: Record<string, number> = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};

type TimelineDate = { year: string; month?: string } | null;

export function timelineToTimestamp(
  d: TimelineDate,
): ResultShape<number, string> {
  if (!d) return Result.error("timeline date is null");
  const year = Number(d.year);
  if (Number.isNaN(year) || year < 0)
    return Result.error(`invalid year: ${d.year}`);
  if (d.month && !(d.month in MONTHS))
    return Result.error(`invalid month: ${d.month}`);
  const month = d.month ? MONTHS[d.month] : 1;
  return Result.ok(new Date(year, month - 1).getTime() / 1000);
}

export function isStartAfterEnd(
  start: number,
  end: number,
): ResultShape<boolean, string> {
  if (typeof start !== "number" || Number.isNaN(start) || start < 0)
    return Result.error("start must be a valid timestamp");
  if (typeof end !== "number" || Number.isNaN(end) || end < 0)
    return Result.error("end must be a valid timestamp");
  return Result.ok(start > end);
}

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

    const { ongoing, timeline } = args.project;
    const { start, end } = timeline;

    const missing: string[] = [];
    if (!start) missing.push("Start date is required.");
    if (!ongoing && !end)
      missing.push("End date is required when project is not ongoing.");
    if (missing.length > 0) return Result.error(missing);

    if (!ongoing && start && end) {
      const check = Either.zipWith(
        timelineToTimestamp(start),
        timelineToTimestamp(end),
        (s, e) => isStartAfterEnd(s, e),
      );
      const result = Either.match(check, {
        onLeft: (err) => Result.error([err]),
        onRight: (isAfter) =>
          isAfter
            ? Result.error(["Start date must be before or equal to end date"])
            : Result.ok(undefined),
      });
      if (result._tag === "Left") return result;
    }

    await ctx.db.insert("project", {
      ...args.project,
      userId: authUser._id,
    });

    return Result.ok(undefined);
  },
});

export const updateProject = mutation({
  args: {
    project: v.object({
      ...project_schema,
      _id: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) throw new Error("Not authenticated");

    const { _id, ...projectData } = args.project;

    if (projectData.userId && projectData.userId !== authUser._id)
      throw new Error("Unauthorized action");

    if (!_id) throw new Error("Project id is required");

    const existingProject = await ctx.db.get(_id as Id<"project">);
    if (!existingProject) throw new Error("Project not found");

    if (existingProject.userId !== authUser._id)
      throw new Error("Unauthorized action");

    const { ongoing, timeline } = projectData;
    const { start, end } = timeline;

    const missing: string[] = [];
    if (!start) missing.push("Start date is required.");
    if (!ongoing && !end)
      missing.push("End date is required when project is not ongoing.");
    if (missing.length > 0) return Result.error(missing);

    if (!ongoing && start && end) {
      const check = Either.zipWith(
        timelineToTimestamp(start),
        timelineToTimestamp(end),
        (s, e) => isStartAfterEnd(s, e),
      );
      const result = Either.match(check, {
        onLeft: (err) => Result.error([err]),
        onRight: (isAfter) =>
          isAfter
            ? Result.error(["Start date must be before or equal to end date"])
            : Result.ok(undefined),
      });
      if (result._tag === "Left") return result;
    }

    await ctx.db.patch(existingProject._id, projectData);

    return Result.ok(undefined);
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
