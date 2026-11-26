import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { type MutationCtx, mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

/**
 * Bump the denormalized `project.favouriteCount` alongside every favourite
 * insert/delete, so `getProjectFavourite` never counts rows itself.
 */
async function bumpFavouriteCount(
  ctx: MutationCtx,
  projectId: Id<"project">,
  delta: number,
): Promise<void> {
  const project = await ctx.db.get(projectId);
  if (!project) return;

  await ctx.db.patch(projectId, {
    favouriteCount: Math.max(0, (project.favouriteCount ?? 0) + delta),
  });
}

/**
 * Toggle a project favourite for the authenticated user.
 * Returns the new state: true = favourited, false = unfavourited.
 */
export const toggle = mutation({
  args: {
    projectId: v.id("project"),
  },
  handler: async (ctx, { projectId }) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("projectFavourites")
      .withIndex("by_userId_projectId", (q) =>
        q.eq("userId", authUser._id).eq("projectId", projectId),
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      await bumpFavouriteCount(ctx, projectId, -1);
      return false;
    }

    await ctx.db.insert("projectFavourites", {
      userId: authUser._id,
      projectId,
    });
    await bumpFavouriteCount(ctx, projectId, 1);
    return true;
  },
});

/**
 * Get the favourite count for a project and whether the current user
 * has favourited it (null when unauthenticated).
 */
export const getProjectFavourite = query({
  args: {
    projectId: v.id("project"),
  },
  handler: async (ctx, { projectId }) => {
    // Count is denormalized on the project row — no row scan.
    const project = await ctx.db.get(projectId);
    const count = project?.favouriteCount ?? 0;

    let isFavourited: boolean | null = null;
    try {
      const authUser = await authComponent.getAuthUser(ctx);
      if (authUser) {
        const mine = await ctx.db
          .query("projectFavourites")
          .withIndex("by_userId_projectId", (q) =>
            q.eq("userId", authUser._id).eq("projectId", projectId),
          )
          .unique();
        isFavourited = !!mine;
      }
    } catch {
      // unauthenticated — leave null
    }

    return { count, isFavourited };
  },
});

/**
 * List all projects favourited by the currently authenticated user.
 */
export const listMyFavourites = query({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) return [];

    const favourites = await ctx.db
      .query("projectFavourites")
      .withIndex("by_userId", (q) => q.eq("userId", authUser._id))
      .order("desc")
      .collect();

    const projects = await Promise.all(
      favourites.map(async (fav) => {
        const project = await ctx.db.get(fav.projectId);
        if (!project) return null;

        const owner = await ctx.db
          .query("profile")
          .withIndex("by_userId", (q) => q.eq("userId", project.userId))
          .unique();

        return {
          ...project,
          favouritedAt: fav._creationTime,
          owner: owner
            ? {
                firstName: owner.firstName,
                lastName: owner.lastName,
                username: owner.username,
                profileImage: owner.profileImage,
              }
            : null,
        };
      }),
    );

    return projects.filter((p): p is NonNullable<typeof p> => p !== null);
  },
});
