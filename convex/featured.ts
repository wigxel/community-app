import { queryGeneric as query } from "convex/server";
import { v } from "convex/values";
import type { BasicProject } from "../types/models";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { toStandardProject } from "./project";

// How far back the rolling windows reach when ranking favourites.
const WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
const LIMIT = 20;
// ponytail: single-scan cap on the newest favourites; paginate window scans
// in chunks if projectFavourites ever outgrows this.
const FAVOURITE_SCAN_CAP = 1000;

// ---------------------------------------------------------------------------
// Public query – reads the snapshot in rank order and joins each row into a
// standard project for the marquee. Empty snapshot (fresh environment, before
// the first cron run) falls back to the latest published projects so the
// marquee never renders empty.
// ---------------------------------------------------------------------------
export const listFeatured = query({
  args: {},
  handler: async (ctx): Promise<BasicProject[]> => {
    const rows = await ctx.db
      .query("featuredProjects")
      .withIndex("by_rank")
      .order("asc")
      .take(LIMIT);

    if (rows.length === 0) {
      const records = await ctx.db
        .query("project")
        .filter((q) => q.neq(q.field("published"), false))
        .order("desc")
        .take(LIMIT);

      return await Promise.all(
        records.map((project) => toStandardProject(ctx, project)),
      );
    }

    const projects = await Promise.all(
      rows.map(async (row) => {
        const project = await ctx.db.get(row.projectId);
        // Skip projects deleted or unpublished after the snapshot was taken.
        if (!project || project.published === false) return null;
        return toStandardProject(ctx, project);
      }),
    );

    return projects.filter((p): p is NonNullable<typeof p> => p !== null);
  },
});

/**
 * Rank projects by favourites over rolling 30-day windows anchored at `now`:
 * recent window wins, deduped window by window, then padded from `backfill`
 * (latest projects) until LIMIT. Pure so the cron-free behaviour is
 * unit-testable.
 */
export function rankFeatured(
  favourites: Array<{
    projectId: Id<"project">;
    favouritedAt: number;
    projectCreatedAt: number;
  }>,
  backfill: Array<{ projectId: Id<"project">; projectCreatedAt: number }>,
  now: number,
): Array<{ projectId: Id<"project">; favouriteCount: number }> {
  const sorted = [...favourites].sort(
    (a, b) => b.favouritedAt - a.favouritedAt,
  );

  const ranked: Array<{ projectId: Id<"project">; favouriteCount: number }> =
    [];
  const seen = new Set<string>();
  let cursor = 0;

  // Walk window by window, consuming the newest rows first.
  for (let w = 0; cursor < sorted.length && ranked.length < LIMIT; w++) {
    const windowStart = now - (w + 1) * WINDOW_MS;
    const windowCounts = new Map<
      string,
      { count: number; projectCreatedAt: number }
    >();

    while (
      cursor < sorted.length &&
      sorted[cursor].favouritedAt >= windowStart
    ) {
      const fav = sorted[cursor];
      const entry = windowCounts.get(fav.projectId);
      if (entry) {
        entry.count++;
      } else {
        windowCounts.set(fav.projectId, {
          count: 1,
          projectCreatedAt: fav.projectCreatedAt,
        });
      }
      cursor++;
    }

    // Most favourited first; newer project wins ties.
    const windowRanked = [...windowCounts.entries()].sort(
      (a, b) =>
        b[1].count - a[1].count ||
        b[1].projectCreatedAt - a[1].projectCreatedAt,
    );

    for (const [projectId, { count }] of windowRanked) {
      if (ranked.length >= LIMIT) break;
      if (seen.has(projectId)) continue;
      seen.add(projectId);
      ranked.push({
        projectId: projectId as Id<"project">,
        favouriteCount: count,
      });
    }
  }

  // Backfill with the latest projects the windows have not already covered.
  for (const candidate of backfill) {
    if (ranked.length >= LIMIT) break;
    if (seen.has(candidate.projectId)) continue;
    seen.add(candidate.projectId);
    ranked.push({ projectId: candidate.projectId, favouriteCount: 0 });
  }

  return ranked;
}

// ---------------------------------------------------------------------------
// Internal query – raw material for the recompute action: every favourite
// (with the project's creation time for tie-breaking, skipping deleted or
// unpublished projects) plus the latest published projects as backfill.
// ---------------------------------------------------------------------------
export const fetchFavouriteData = internalQuery({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("projectFavourites")
      .order("desc")
      .take(FAVOURITE_SCAN_CAP);

    const favourites = [];
    for (const row of rows) {
      const project = await ctx.db.get(row.projectId);
      if (!project || project.published === false) continue;
      favourites.push({
        projectId: row.projectId,
        favouritedAt: row._creationTime,
        projectCreatedAt: project._creationTime,
      });
    }

    const backfill = await ctx.db
      .query("project")
      .filter((q) => q.neq(q.field("published"), false))
      .order("desc")
      .take(LIMIT * 2);

    return {
      favourites,
      backfill: backfill.map((project) => ({
        projectId: project._id,
        projectCreatedAt: project._creationTime,
      })),
    };
  },
});

// ---------------------------------------------------------------------------
// Internal mutation – atomically replaces the snapshot with the freshly
// computed ranking.
// ---------------------------------------------------------------------------
export const replaceSnapshot = internalMutation({
  args: {
    rows: v.array(
      v.object({
        projectId: v.id("project"),
        favouriteCount: v.number(),
      }),
    ),
    computedAt: v.number(),
  },
  handler: async (ctx, { rows, computedAt }) => {
    for await (const existing of ctx.db.query("featuredProjects")) {
      await ctx.db.delete(existing._id);
    }

    for (const [index, row] of rows.entries()) {
      await ctx.db.insert("featuredProjects", {
        projectId: row.projectId,
        rank: index + 1,
        favouriteCount: row.favouriteCount,
        computedAt,
      });
    }
  },
});

// ---------------------------------------------------------------------------
// Internal action – the heavy multi-window scan, run daily by the cron at
// 00:30 UTC (staggered after the leaderboard's midnight recompute).
// ---------------------------------------------------------------------------
export const recomputeFeatured = internalAction({
  args: {
    // Overrides the wall clock; the cron omits it.
    now: v.optional(v.number()),
  },
  async handler(ctx, args) {
    const { favourites, backfill } = await ctx.runQuery(
      internal.featured.fetchFavouriteData,
      {},
    );

    const now = args.now ?? Date.now();
    const ranked = rankFeatured(favourites, backfill, now);

    await ctx.runMutation(internal.featured.replaceSnapshot, {
      rows: ranked.map(({ projectId, favouriteCount }) => ({
        projectId,
        favouriteCount,
      })),
      computedAt: now,
    });

    console.log(`[Featured] Recomputed ${ranked.length} featured projects`);
  },
});
