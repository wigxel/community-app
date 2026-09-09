import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import {
  internalAction,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";

// ---------------------------------------------------------------------------
// Public query – reads pre-computed rankings from the leaderboardIndex table.
// This is extremely cheap: a single index scan, no joins, no in-memory sort.
// ---------------------------------------------------------------------------
export const getLeaderboard = query({
  args: {
    titleName: v.string(),
  },
  async handler(ctx, args) {
    const title = await ctx.db
      .query("titles")
      .withIndex("by_name", (q) => q.eq("name", args.titleName))
      .unique();

    if (!title) return [];

    return await ctx.db
      .query("leaderboardIndex")
      .withIndex("by_titleId_ranking", (q) => q.eq("titleId", title._id))
      .take(100);
  },
});

// ---------------------------------------------------------------------------
// Internal query – fetches all raw data needed to compute rankings for a title.
// Called by the recompute action so we stay within a single read transaction.
// ---------------------------------------------------------------------------
export const fetchRankingData = internalQuery({
  args: { titleId: v.id("titles") },
  async handler(ctx, args) {
    const profiles = await ctx.db
      .query("profile")
      .withIndex("by_title", (q) => q.eq("title", args.titleId))
      .collect();

    const results = await Promise.all(
      profiles.map(async (profile) => {
        let score = 0;

        // Resolve skills
        let resolvedSkills: Array<{
          name: string;
          description: string | null;
        }> = [];
        if (profile.skills) {
          score += profile.skills.length * 2;
          const s = await Promise.all(
            profile.skills.map((skillId: Id<"skills">) => ctx.db.get(skillId)),
          );
          resolvedSkills = s
            .filter((s): s is NonNullable<typeof s> => s !== null)
            .map((s) => ({
              name: s.name,
              description: s.description,
            }));
        }

        // Resolve work experiences
        const resolvedExperiences: Array<{
          position: string;
          companyName: string;
          durationYears: number;
        }> = [];
        if (profile.userId) {
          const workExps = await ctx.db
            .query("workExperience")
            .withIndex("by_userId", (q) => q.eq("userId", profile.userId || ""))
            .collect();

          for (const exp of workExps) {
            const end = exp.timeline.end || Date.now();
            const start = exp.timeline.start;
            const years = (end - start) / (1000 * 60 * 60 * 24 * 365);
            if (years > 0) {
              score += Math.floor(years * 10);
            }
            resolvedExperiences.push({
              position: exp.position,
              companyName: exp.companyName,
              durationYears: Number(years.toFixed(1)),
            });
          }
        }

        // Determine badge
        let badge = "Sapphire";
        if (score > 100) badge = "Gold";
        else if (score > 50) badge = "Diamond";
        else if (score > 20) badge = "Ruby";

        const stars = Math.min(5, Number((score / 20).toFixed(1)));

        return {
          profileId: profile._id,
          userId: profile.userId,
          firstName: profile.firstName,
          lastName: profile.lastName,
          username: profile.username,
          profileImage: profile.profileImage,
          shortBio: profile.shortBio,
          location: profile.location,
          score,
          stars,
          badge,
          resolvedSkills,
          resolvedExperiences,
        };
      }),
    );

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);

    return results;
  },
});

// ---------------------------------------------------------------------------
// Internal mutation – upserts a single ranking row into leaderboardIndex.
// Called in a loop from the recompute action (one mutation per entry).
// ---------------------------------------------------------------------------
export const upsertRankingEntry = internalMutation({
  args: {
    profileId: v.id("profile"),
    titleId: v.id("titles"),
    ranking: v.number(),
    score: v.number(),
    badge: v.string(),
    stars: v.number(),
    userId: v.optional(v.string()),
    firstName: v.string(),
    lastName: v.string(),
    username: v.string(),
    profileImage: v.nullable(v.string()),
    shortBio: v.optional(v.nullable(v.string())),
    location: v.optional(v.object({ city: v.string(), country: v.string() })),
    resolvedSkills: v.array(
      v.object({ name: v.string(), description: v.nullable(v.string()) }),
    ),
    resolvedExperiences: v.array(
      v.object({
        position: v.string(),
        companyName: v.string(),
        durationYears: v.number(),
      }),
    ),
  },
  async handler(ctx, args) {
    // Check if an existing entry exists for this profile + title
    const existing = await ctx.db
      .query("leaderboardIndex")
      .withIndex("by_profileId_titleId", (q) =>
        q.eq("profileId", args.profileId).eq("titleId", args.titleId),
      )
      .unique();

    const data = {
      profileId: args.profileId,
      titleId: args.titleId,
      ranking: args.ranking,
      score: args.score,
      badge: args.badge,
      stars: args.stars,
      userId: args.userId,
      firstName: args.firstName,
      lastName: args.lastName,
      username: args.username,
      profileImage: args.profileImage,
      shortBio: args.shortBio,
      location: args.location,
      resolvedSkills: args.resolvedSkills,
      resolvedExperiences: args.resolvedExperiences,
      lastUpdated: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
    } else {
      await ctx.db.insert("leaderboardIndex", data);
    }
  },
});

// ---------------------------------------------------------------------------
// Internal mutation – removes stale leaderboard entries for profiles that
// no longer belong to a title (e.g. profile deleted or title changed).
// ---------------------------------------------------------------------------
export const removeStaleEntries = internalMutation({
  args: {
    titleId: v.id("titles"),
    activeProfileIds: v.array(v.id("profile")),
  },
  async handler(ctx, args) {
    const allEntries = await ctx.db
      .query("leaderboardIndex")
      .withIndex("by_titleId_ranking", (q) => q.eq("titleId", args.titleId))
      .collect();

    const activeSet = new Set(args.activeProfileIds);
    for (const entry of allEntries) {
      if (!activeSet.has(entry.profileId)) {
        await ctx.db.delete(entry._id);
      }
    }
  },
});

// ---------------------------------------------------------------------------
// Internal action – the heavy recompute job. Reads all data via an internal
// query, then writes pre-ranked entries via internal mutations.
// Designed to be called by the daily cron job.
// ---------------------------------------------------------------------------
export const recomputeRankings = internalAction({
  args: {},
  async handler(ctx) {
    // Fetch all titles
    const titles: Array<{ _id: Id<"titles">; name: string }> =
      await ctx.runQuery(api.titles.listTitles, {});

    for (const title of titles) {
      // Fetch and compute rankings for this title
      const rankedProfiles = await ctx.runQuery(
        internal.leaderboard.fetchRankingData,
        { titleId: title._id },
      );

      // Upsert each ranked profile
      for (let i = 0; i < rankedProfiles.length; i++) {
        const profile = rankedProfiles[i];
        await ctx.runMutation(internal.leaderboard.upsertRankingEntry, {
          profileId: profile.profileId,
          titleId: title._id,
          ranking: i + 1, // 1-based ranking
          score: profile.score,
          badge: profile.badge,
          stars: profile.stars,
          userId: profile.userId,
          firstName: profile.firstName,
          lastName: profile.lastName,
          username: profile.username,
          profileImage: profile.profileImage,
          shortBio: profile.shortBio,
          location: profile.location,
          resolvedSkills: profile.resolvedSkills,
          resolvedExperiences: profile.resolvedExperiences,
        });
      }

      // Clean up stale entries (profiles no longer under this title)
      await ctx.runMutation(internal.leaderboard.removeStaleEntries, {
        titleId: title._id,
        activeProfileIds: rankedProfiles.map((p) => p.profileId),
      });

      console.log(
        `[Leaderboard] Recomputed ${rankedProfiles.length} rankings for "${title.name}"`,
      );
    }
  },
});
