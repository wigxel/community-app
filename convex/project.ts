import {
  type AnyDataModel,
  type GenericMutationCtx,
  type GenericQueryCtx,
  type PaginationResult,
  paginationOptsValidator,
  queryGeneric as query,
} from "convex/server";
import { v } from "convex/values";
import { Either } from "effect";
import { countWords, MAX_PROJECT_DESCRIPTION_WORDS } from "../lib/markdown";
import { Result, type ResultShape } from "../lib/result";
import { MAX_PROJECT_TAGS, MAX_TAG_LENGTH, normalizeTags } from "../lib/tags";
import type { BasicProject, Project } from "../types/models";
import { api, internal } from "./_generated/api";
import type { DataModel, Doc, Id } from "./_generated/dataModel";
import { internalMutation, mutation } from "./_generated/server";
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

async function toStandardProject(
  ctx: GenericQueryCtx<AnyDataModel>,
  project: Doc<"project">,
): Promise<BasicProject> {
  const DEFAULT_USERNAME = "@anonymous";

  if (!project?.userId) {
    // @ts-expect-error @todo: fix typing later
    return { ...project, username: DEFAULT_USERNAME, ownerName: null };
  }

  const profile = await ctx.runQuery(api.profiles.getProfileByAuthId, {
    userId: project.userId,
  });

  if (!profile) {
    // @ts-expect-error @todo: fix typing later
    return { ...project, username: DEFAULT_USERNAME, ownerName: null };
  }

  // @ts-expect-error @todo: fix typing later
  return {
    ...project,
    username: profile?.username ?? DEFAULT_USERNAME,
    ownerName: `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim(),
  };
}

/**
 * Maintain the denormalized `profile.projectCount` total.
 *
 * Keyed by email: `profile.userId` is optional in the schema and legacy rows
 * may lack it, while email is required — it is the identity `getProfile` and
 * `createProfile` already look profiles up by.
 *
 * Returns false when no profile exists yet (project created before onboarding
 * completed); `createProfile` seeds the total when the profile arrives.
 */
export async function bumpProjectCount(
  ctx: GenericMutationCtx<DataModel>,
  email: string,
  delta: number,
): Promise<boolean> {
  const profile = await ctx.db
    .query("profile")
    .withIndex("by_email", (q) => q.eq("email", email))
    .first();

  if (!profile) return false;

  await ctx.db.patch(profile._id, {
    projectCount: Math.max(0, (profile.projectCount ?? 0) + delta),
  });

  return true;
}

/**
 * Set `projectCount` on a freshly created profile. Projects may already exist
 * because `/dashboard/projects` is reachable before onboarding completes.
 * Bounded by one user's projects, run once at profile creation.
 */
export async function seedProjectCount(
  ctx: GenericMutationCtx<DataModel>,
  profileId: Id<"profile">,
  userId: string,
): Promise<void> {
  let count = 0;
  for await (const _ of ctx.db
    .query("project")
    .withIndex("by_userId", (q) => q.eq("userId", userId))) {
    count++;
  }

  await ctx.db.patch(profileId, { projectCount: count });
}

const project_args = {
  ...project_schema,
  tags: v.array(v.string()),
};

function normalizeProjectTags(tags: readonly string[]): string[] {
  const normalized = normalizeTags(tags);

  if (normalized.length > MAX_PROJECT_TAGS)
    throw new Error(`Max of ${MAX_PROJECT_TAGS} tags per project`);
  if (normalized.some((tag) => tag.length > MAX_TAG_LENGTH))
    throw new Error(`Tags cannot exceed ${MAX_TAG_LENGTH} characters`);

  return normalized;
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
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...result,
      page: await Promise.all(
        result.page.map((doc) => toStandardProject(ctx, doc)),
      ),
    };
  },
});

export const listProjectByUserId = query({
  args: { userId: v.string(), paginationOpts: paginationOptsValidator },
  handler: async (ctx, args): Promise<PaginationResult<BasicProject>> => {
    const result = await ctx.db
      .query("project")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.neq(q.field("published"), false))
      .order("desc")
      .paginate({
        ...args.paginationOpts,
        numItems: Math.min(50, args.paginationOpts.numItems),
      });

    return {
      ...result,
      page: await Promise.all(
        result.page.map((doc) => toStandardProject(ctx, doc)),
      ),
    };
  },
});

export const getProject = query({
  args: { id: v.nullable(v.string()) },
  handler: async (ctx, args) => {
    const doc: Doc<"project"> | null = await ctx.db
      .query("project")
      .filter((q) => q.eq(q.field("_id"), args.id))
      .first();

    if (doc == null) return Result.error("Not found");

    // Unpublished projects are not publicly accessible: callers get the
    // same "Not found" result as a missing id, so the public detail page
    // renders its not-found state (already noindex). The owner still gets
    // the doc so the dashboard edit page can load and publish it.
    if (doc.published === false) {
      const authUser = await authComponent.getAuthUser(ctx);
      if (authUser?._id !== doc.userId) return Result.error("Not found");
    }

    return Result.ok(await toStandardProject(ctx, doc));
  },
});

/**
 * Insert, replace, or remove the long-form Markdown row for a project.
 * Empty/whitespace markdown removes the row so cleared fields don't leave
 * orphaned content behind.
 */
async function writeProjectDescription(
  ctx: GenericMutationCtx<DataModel>,
  projectId: Id<"project">,
  markdown: string,
): Promise<void> {
  if (countWords(markdown) > MAX_PROJECT_DESCRIPTION_WORDS)
    throw new Error(
      `Description cannot exceed ${MAX_PROJECT_DESCRIPTION_WORDS} words.`,
    );

  const existing = await ctx.db
    .query("projectDescription")
    .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
    .first();

  if (markdown.trim() === "") {
    if (existing) await ctx.db.delete("projectDescription", existing._id);
    return;
  }

  if (existing) {
    await ctx.db.patch("projectDescription", existing._id, { markdown });
  } else {
    await ctx.db.insert("projectDescription", { projectId, markdown });
  }
}

export const createProject = mutation({
  args: {
    project: v.object(project_args),
    longDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) throw new Error("Not authenticated");

    if (args.project.link.length > 3)
      throw new Error("Max of 3 links per project");

    const nonOtherLinks = args.project.link.filter((l) => l.tag !== "other");
    if (new Set(nonOtherLinks.map((l) => l.tag)).size !== nonOtherLinks.length)
      throw new Error("Duplicate link types are not allowed");

    const tags = normalizeProjectTags(args.project.tags);

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

    const projectId = await ctx.db.insert("project", {
      ...args.project,
      tags,
      userId: authUser._id,
      published: args.project.published ?? true,
      lastUpdatedAt: Date.now(),
    });

    await bumpProjectCount(ctx, authUser.email, 1);

    if (args.longDescription !== undefined)
      await writeProjectDescription(ctx, projectId, args.longDescription);

    // Schedule blurhash generation for photos
    await ctx.scheduler.runAfter(0, internal.blurhash.generateForProject, {
      projectId,
    });

    return Result.ok(undefined);
  },
});

export const updateProject = mutation({
  args: {
    project: v.object({
      ...project_args,
      _id: v.optional(v.string()),
    }),
    longDescription: v.optional(v.string()),
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

    if (projectData.link.length > 3)
      throw new Error("Max of 3 links per project");

    const nonOtherLinks = projectData.link.filter((l) => l.tag !== "other");
    if (new Set(nonOtherLinks.map((l) => l.tag)).size !== nonOtherLinks.length)
      throw new Error("Duplicate link types are not allowed");

    const tags = normalizeProjectTags(projectData.tags);

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

    await ctx.db.patch(existingProject._id, {
      ...projectData,
      tags,
      lastUpdatedAt: Date.now(),
    });

    if (args.longDescription !== undefined)
      await writeProjectDescription(
        ctx,
        existingProject._id,
        args.longDescription,
      );

    // Schedule blurhash generation for photos
    await ctx.scheduler.runAfter(0, internal.blurhash.generateForProject, {
      projectId: existingProject._id,
    });

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

    // Delete matching favourite rows — they'd otherwise orphan forever.
    for await (const fav of ctx.db
      .query("projectFavourites")
      .withIndex("by_projectId", (q) =>
        q.eq("projectId", existingProject._id),
      )) {
      await ctx.db.delete(fav._id);
    }

    // Remove the long-form description row so it can't orphan.
    for await (const row of ctx.db
      .query("projectDescription")
      .withIndex("by_projectId", (q) =>
        q.eq("projectId", existingProject._id),
      )) {
      await ctx.db.delete("projectDescription", row._id);
    }

    await bumpProjectCount(ctx, authUser.email, -1);
  },
});

export const setProjectPublished = mutation({
  args: { _id: v.id("project"), published: v.boolean() },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) throw new Error("Not authenticated");

    const existingProject = await ctx.db.get(args._id);
    if (!existingProject) throw new Error("Project not found");

    if (existingProject.userId !== authUser._id)
      throw new Error("Unauthorized action");

    await ctx.db.patch(existingProject._id, {
      published: args.published,
      lastUpdatedAt: Date.now(),
    });
  },
});

export const updateProjectMedia = internalMutation({
  args: {
    projectId: v.id("project"),
    media: v.array(
      v.object({
        type: v.union(v.literal("photo"), v.literal("pdf"), v.literal("video")),
        metadata: v.object({
          url: v.string(),
          title: v.optional(v.string()),
          filename: v.string(),
          mimeType: v.string(),
          size: v.number(),
          duration: v.optional(v.number()),
          width: v.optional(v.number()),
          height: v.optional(v.number()),
          storageId: v.optional(v.string()),
          blurhash: v.optional(v.string()),
          blurDataURL: v.optional(v.string()),
        }),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.projectId, { media: args.media });
  },
});

/**
 * One-off: rewrite tags saved before hashtag normalisation (case, spaces,
 * punctuation). Run per deployment with:
 *   bunx convex run project:backfillProjectTags
 */
export const backfillProjectTags = internalMutation({
  args: {},
  handler: async (ctx) => {
    let updated = 0;

    for await (const project of ctx.db.query("project")) {
      const current = project.tags ?? [];
      const normalized = normalizeTags(current);

      const changed =
        normalized.length !== current.length ||
        normalized.some((tag, index) => tag !== current[index]);
      if (!changed) continue;

      await ctx.db.patch(project._id, { tags: normalized });
      updated++;
    }

    return { updated };
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
      .filter((q) => q.neq(q.field("published"), false))
      .order("desc")
      .paginate({
        ...paginationOpts,
        numItems: Math.min(50, paginationOpts.numItems),
      });

    return {
      ...records,
      page: await Promise.all(
        records.page.map(async (project) => toStandardProject(ctx, project)),
      ),
    };
  },
});

export const search = query({
  args: {
    paginationOpts: paginationOptsValidator,
    q: v.string(),
  },
  handler: async (
    ctx,
    { paginationOpts, q },
  ): Promise<PaginationResult<BasicProject>> => {
    const trimmed = q.trim();

    // Empty query → return empty page (the /search page handles the prompt state)
    if (!trimmed) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    const records = await ctx.db
      .query("project")
      .withSearchIndex("search_title", (s) => s.search("title", trimmed))
      .filter((q) => q.neq(q.field("published"), false))
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
