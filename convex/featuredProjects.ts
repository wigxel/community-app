import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";

// Keep in sync with FEATURED_LIMIT in convex/project.ts.
const FEATURED_LIMIT = 20;
const WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
// Upper bound on favourites read per window so a single window query stays
// well inside Convex's transaction read limits.
const MAX_FAVOURITES_PER_WINDOW = 8000;

type WindowEntry = {
  projectId: Id<"project">;
  windowCount: number;
  // Project's all-time total, stored on the snapshot row.
  favouriteCount: number;
  projectCreationTime: number;
};

// ---------------------------------------------------------------------------
// Internal query – favourite counts per project within [start, end), ranked
// by count desc, tie-broken by newer project. Deleted projects are skipped.
// ---------------------------------------------------------------------------
export const rankWindow = internalQuery({
  args: { start: v.number(), end: v.number() },
  async handler(ctx, { start, end }): Promise<WindowEntry[]> {
    const favourites = await ctx.db
      .query("projectFavourites")
      .withIndex("by_creation_time", (q) =>
        q.gte("_creationTime", start).lt("_creationTime", end),
      )
      .take(MAX_FAVOURITES_PER_WINDOW);

    const counts = new Map<Id<"project">, number>();
    for (const fav of favourites) {
      counts.set(fav.projectId, (counts.get(fav.projectId) ?? 0) + 1);
    }

    const entries = await Promise.all(
      [...counts].map(async ([projectId, windowCount]) => {
        const project = await ctx.db.get(projectId);
        // Skip deleted and unpublished projects.
        return project && project.published !== false
          ? {
              projectId,
              windowCount,
              favouriteCount: project.favouriteCount ?? windowCount,
              projectCreationTime: project._creationTime,
            }
          : null;
      }),
    );

    return entries
      .filter((e): e is WindowEntry => e !== null)
      .sort(
        (a, b) =>
          b.windowCount - a.windowCount ||
          b.projectCreationTime - a.projectCreationTime,
      );
  },
});

// ---------------------------------------------------------------------------
// Internal query – creation time of the oldest favourite, so the recompute
// knows when favourite history is exhausted. Null when there are none.
// ---------------------------------------------------------------------------
export const oldestFavouriteTime = internalQuery({
  args: {},
  async handler(ctx): Promise<number | null> {
    const oldest = await ctx.db.query("projectFavourites").order("asc").first();
    return oldest?._creationTime ?? null;
  },
});

// ---------------------------------------------------------------------------
// Internal query – latest projects (newest first), used to pad the snapshot.
// ---------------------------------------------------------------------------
export const latestProjects = internalQuery({
  args: { limit: v.number() },
  async handler(ctx, { limit }) {
    const projects = await ctx.db
      .query("project")
      .order("desc")
      .filter((q) => q.neq(q.field("published"), false))
      .take(limit);
    return projects.map((p) => ({
      projectId: p._id,
      favouriteCount: p.favouriteCount ?? 0,
    }));
  },
});

// ---------------------------------------------------------------------------
// Internal mutation – atomically replaces the snapshot with the new ranking.
// ---------------------------------------------------------------------------
export const replaceSnapshot = internalMutation({
  args: {
    entries: v.array(
      v.object({ projectId: v.id("project"), favouriteCount: v.number() }),
    ),
  },
  async handler(ctx, { entries }) {
    for await (const row of ctx.db.query("featuredProjects")) {
      await ctx.db.delete(row._id);
    }

    const computedAt = Date.now();
    for (const [i, entry] of entries.entries()) {
      await ctx.db.insert("featuredProjects", {
        projectId: entry.projectId,
        favouriteCount: entry.favouriteCount,
        rank: i + 1, // 1-based rank
        computedAt,
      });
    }
  },
});

// ---------------------------------------------------------------------------
// Internal action – the daily recompute. Walks back through 30-day windows
// (most recent first), appending each window's most-favourited projects not
// already included, until FEATURED_LIMIT is reached or history runs out.
// Any remaining slots are padded with the latest projects.
// ---------------------------------------------------------------------------
export const recomputeFeatured = internalAction({
  args: {},
  async handler(ctx) {
    const now = Date.now();
    const oldest: number | null = await ctx.runQuery(
      internal.featuredProjects.oldestFavouriteTime,
      {},
    );

    const featured = new Map<Id<"project">, number>();

    if (oldest !== null) {
      for (
        let end = now;
        end > oldest && featured.size < FEATURED_LIMIT;
        end -= WINDOW_MS
      ) {
        const ranked: WindowEntry[] = await ctx.runQuery(
          internal.featuredProjects.rankWindow,
          { start: end - WINDOW_MS, end },
        );
        for (const entry of ranked) {
          if (featured.size >= FEATURED_LIMIT) break;
          if (!featured.has(entry.projectId)) {
            featured.set(entry.projectId, entry.favouriteCount);
          }
        }
      }
    }

    if (featured.size < FEATURED_LIMIT) {
      const latest: Array<{
        projectId: Id<"project">;
        favouriteCount: number;
      }> = await ctx.runQuery(internal.featuredProjects.latestProjects, {
        limit: FEATURED_LIMIT * 2,
      });
      for (const entry of latest) {
        if (featured.size >= FEATURED_LIMIT) break;
        if (!featured.has(entry.projectId)) {
          featured.set(entry.projectId, entry.favouriteCount);
        }
      }
    }

    const entries = [...featured].map(([projectId, favouriteCount]) => ({
      projectId,
      favouriteCount,
    }));
    await ctx.runMutation(internal.featuredProjects.replaceSnapshot, {
      entries,
    });

    console.log(`[Featured] Recomputed ${entries.length} featured projects`);
  },
});
