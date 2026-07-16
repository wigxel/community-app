import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { query } from "./_generated/server";

export const getLeaderboard = query({
  args: {
    titleName: v.string(),
  },
  async handler(ctx, args) {
    const title = await ctx.db
      .query("titles")
      .filter((q) => q.eq(q.field("name"), args.titleName))
      .unique();

    if (!title) return [];

    const profiles = await ctx.db
      .query("profile")
      .filter((q) => q.eq(q.field("title"), title._id))
      .collect();

    const rankedProfiles = await Promise.all(
      profiles.map(async (profile) => {
        let score = 0;

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
          _id: profile._id,
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

    rankedProfiles.sort((a, b) => b.score - a.score);

    return rankedProfiles;
  },
});
