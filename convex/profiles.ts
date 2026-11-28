import { queryGeneric as query } from "convex/server";
import { ConvexError, v } from "convex/values";
import { ProfileImpl } from "../lib/factories/profile";
import {
  formatDate,
  monthlyEquivalent,
  RATE_LOCK_MS,
  RATE_UNIT_SCHEMA,
  rateBand,
  rateUnlocksAt,
} from "../lib/rate-band";
import { Result } from "../lib/result";
import { validateUsernameFormat } from "../lib/username";
import type { Profile, TalentProfile } from "../types/models";
import type { Id } from "./_generated/dataModel";
import { mutation, type QueryCtx } from "./_generated/server";
import { authComponent } from "./auth";
import { seedProjectCount } from "./project";

// Hard caps for user-entered profile text, clamped (not rejected) so saves
// never fail on length. ponytail: server-side only; add maxLength to the
// profile form inputs if silent truncation surprises anyone.
export const PROFILE_TEXT_CAPS = {
  firstName: 80,
  lastName: 80,
  phoneNumber: 40,
  phoneNumbers: 5,
  shortBio: 280,
  interest: 60,
  interests: 20,
  linkTag: 40,
  linkTitle: 80,
  linkValue: 512,
  links: 10,
  city: 80,
  country: 80,
  imageUrl: 512,
} as const;

const clamp = (s: string, max: number) =>
  s.length > max ? s.slice(0, max) : s;
const clampNullable = (s: string | null, max: number) =>
  s === null ? null : clamp(s, max);

export function clampProfileText(args: {
  firstName: string;
  lastName: string;
  phoneNumbers: string[];
  shortBio?: string;
  profileImage?: string | null;
  coverImage?: string | null;
  interests?: string[];
  links?: { tag: string; title: string; value: string }[];
  location?: { city: string; country: string };
}) {
  const caps = PROFILE_TEXT_CAPS;
  return {
    firstName: clamp(args.firstName, caps.firstName),
    lastName: clamp(args.lastName, caps.lastName),
    phoneNumbers: args.phoneNumbers
      .slice(0, caps.phoneNumbers)
      .map((p) => clamp(p, caps.phoneNumber)),
    ...(args.shortBio !== undefined && {
      shortBio: clamp(args.shortBio, caps.shortBio),
    }),
    ...(args.profileImage !== undefined && {
      profileImage: clampNullable(args.profileImage, caps.imageUrl),
    }),
    ...(args.coverImage !== undefined && {
      coverImage: clampNullable(args.coverImage, caps.imageUrl),
    }),
    ...(args.interests !== undefined && {
      interests: args.interests
        .slice(0, caps.interests)
        .map((i) => clamp(i, caps.interest)),
    }),
    ...(args.links !== undefined && {
      links: args.links.slice(0, caps.links).map((l) => ({
        tag: clamp(l.tag, caps.linkTag),
        title: clamp(l.title, caps.linkTitle),
        value: clamp(l.value, caps.linkValue),
      })),
    }),
    ...(args.location !== undefined && {
      location: {
        city: clamp(args.location.city, caps.city),
        country: clamp(args.location.country, caps.country),
      },
    }),
  };
}

export const listProfile = query({
  args: {
    titleId: v.optional(v.id("titles")),
    searchTerm: v.optional(v.string()),
  },
  async handler(ctx, args) {
    let usersQuery = ctx.db.query("profile");

    if (args.titleId) {
      usersQuery = usersQuery.filter((q) =>
        q.eq(q.field("title"), args.titleId),
      );
    }

    const users = await usersQuery.collect();

    let filteredUsers = users;
    if (args.searchTerm) {
      const searchLower = args.searchTerm.toLowerCase();
      filteredUsers = users.filter((user) => {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        return (
          fullName.includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
        );
      });
    }

    const enrichedUsers = await Promise.all(
      filteredUsers.map(async (user): Promise<TalentProfile> => {
        const title = user.title ? await ctx.db.get(user.title) : null;

        const workExps = user.userId
          ? await ctx.db
              .query("workExperience")
              .withIndex("by_userId", (q) => q.eq("userId", user.userId))
              .collect()
          : [];

        const totalYearsOfExperience =
          ProfileImpl.computeTotalYearsOfExperience(
            workExps.map((exp) => ({ timeline: exp.timeline })),
          );

        return {
          ...user,
          title,
          totalYearsOfExperience,
          // @todo: Implement seniority feature — derive from leaderboard score or user input
          seniority: "none",
          rateBand: user.rate ? rateBand(user.rate.amount) : null,
        };
      }),
    );

    // Talent listing is public: never expose exact rates.
    return enrichedUsers.map(({ rate: _rate, ...user }) => user);
  },
});

// Resolves a stored image value to a display URL: storage ids → signed URL,
// legacy string URLs / data URLs pass through unchanged.
// ponytail: prefix heuristic to tell ids from URLs; add a kind field if that ever breaks
async function imageUrl(
  ctx: Pick<QueryCtx, "storage">,
  value: Id<"_storage"> | string | null | undefined,
): Promise<string | null> {
  if (!value) return null;
  if (/^(https?:|data:)/.test(value)) return value;
  return await ctx.storage.getUrl(value as Id<"_storage">);
}

export const getProfileByUsername = query({
  args: { username: v.string() },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("profile")
      .withIndex("by_username", (q) =>
        q.eq("username", args.username.toLowerCase()),
      )
      .unique();

    if (!user) return null;

    const title = user.title ? await ctx.db.get(user.title) : null;
    // Resolve skill IDs to names for public display.
    const resolvedSkills = (
      await Promise.all(
        (user.skills ?? []).map((skillId: Id<"skills">) => ctx.db.get(skillId)),
      )
    ).filter(Boolean);
    // Public profile: exact rate is owner-only; expose the band instead.
    const { rate, ...publicUser } = user;
    const [profileImage, coverImage] = await Promise.all([
      imageUrl(ctx, user.profileImage),
      imageUrl(ctx, user.coverImage),
    ]);
    return {
      ...publicUser,
      profileImage,
      coverImage,
      title,
      resolvedSkills,
      rateBand: rate ? rateBand(rate.amount) : null,
    };
  },
});

export const getProfileByAuthId = query({
  args: { userId: v.string() },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("profile")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId.toLowerCase()))
      .unique();

    if (!user) return null;

    const title = user.title ? await ctx.db.get(user.title) : null;
    const profileImage = await imageUrl(ctx, user.profileImage);

    return { ...user, title, profileImage };
  },
});

export const checkUsernameAvailability = query({
  args: { username: v.string() },
  async handler(ctx, args) {
    const username = args.username.trim().toLowerCase();

    const formatError = validateUsernameFormat(username);
    if (formatError) {
      return { available: false, reason: formatError };
    }

    const existing = await ctx.db
      .query("profile")
      .withIndex("by_username", (q) => q.eq("username", username))
      .unique();

    if (existing) {
      return { available: false, reason: "Username is already taken" };
    }

    return { available: true, reason: null };
  },
});

export const getProfile = query({
  args: {},
  async handler(ctx): Promise<Profile | null> {
    try {
      const authUser = await authComponent.getAuthUser(ctx);
      if (!authUser) return null;

      const user = await ctx.db
        .query("profile")
        .withIndex("by_email", (q) => q.eq("email", authUser.email))
        .unique();

      if (!user) return null;

      const title = user.title ? await ctx.db.get(user.title) : null;
      const [profileImage, coverImage] = await Promise.all([
        imageUrl(ctx, user.profileImage),
        imageUrl(ctx, user.coverImage),
      ]);
      return { ...user, profileImage, coverImage, title };
    } catch {
      // If authentication fails, return null instead of throwing
      return null;
    }
  },
});

export const getForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) return null;

    return await ctx.db
      .query("profile")
      .withIndex("by_email", (q) => q.eq("email", authUser.email))
      .unique();
  },
});

export const getSkills = query({
  args: {},
  async handler(ctx) {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) return Result.error("Not authenticated");

    const user = await ctx.db
      .query("profile")
      .withIndex("by_email", (q) => q.eq("email", authUser.email))
      .unique();

    if (!user?.skills?.length) return Result.ok([]);

    const skills = await Promise.all(
      user.skills.map((skillId: Id<"skills">) => ctx.db.get(skillId)),
    );

    return Result.ok(skills);
  },
});

export const createProfile = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) throw new ConvexError("Not authenticated");

    const existing = await ctx.db
      .query("profile")
      .withIndex("by_email", (q) => q.eq("email", authUser.email))
      .unique();

    if (existing) return existing._id;

    const username = args.username.trim().toLowerCase();

    const formatError = validateUsernameFormat(username);
    if (formatError) throw new ConvexError(formatError);

    const usernameTaken = await ctx.db
      .query("profile")
      .withIndex("by_username", (q) => q.eq("username", username))
      .unique();

    if (usernameTaken) throw new ConvexError("Username is already taken");

    const profileId = await ctx.db.insert("profile", {
      userId: authUser._id,
      email: authUser.email,
      firstName: args.firstName,
      lastName: args.lastName,
      username,
      phoneNumbers: [],
      profileImage: authUser.image ?? null,
      coverImage: null,
      title: null,
      shortBio: "",
      links: [],
      interests: [],
      location: { city: "", country: "Nigeria" },
      skills: [],
    });

    // Projects can pre-date the profile; don't start the counter at 0.
    await seedProjectCount(ctx, profileId, authUser._id);

    return profileId;
  },
});

export const updateProfile = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    phoneNumbers: v.array(v.string()),
    title: v.optional(v.union(v.id("titles"), v.null())),
    shortBio: v.optional(v.string()),
    profileImage: v.optional(v.union(v.string(), v.null())),
    coverImage: v.optional(v.union(v.string(), v.null())),
    interests: v.optional(v.array(v.string())),
    links: v.optional(
      v.array(
        v.object({
          tag: v.string(),
          title: v.string(),
          value: v.string(),
        }),
      ),
    ),
    location: v.optional(
      v.object({
        city: v.string(),
        country: v.string(),
      }),
    ),
    skills: v.optional(v.array(v.id("skills"))),
    rate: v.optional(
      v.union(
        v.null(),
        v.object({
          amount: v.number(),
          currency: v.optional(v.string()),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) throw new ConvexError("Not authenticated");

    const profile = await ctx.db
      .query("profile")
      .withIndex("by_email", (q) => q.eq("email", authUser.email))
      .unique();

    if (!profile) throw new ConvexError("Profile not found");

    await ctx.db.patch(profile._id, {
      ...clampProfileText(args),
      ...(args.title !== undefined && { title: args.title }),
      ...(args.skills !== undefined && { skills: args.skills }),
      ...(args.rate !== undefined && { rate: args.rate }),
    });

    return profile._id;
  },
});

// Immediate persistence for profile/cover images: stores Convex storage ids
// (null clears the field). Legacy string values are only read, never written.
export const updateProfileImages = mutation({
  args: {
    profileImage: v.optional(v.union(v.id("_storage"), v.null())),
    coverImage: v.optional(v.union(v.id("_storage"), v.null())),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) throw new ConvexError("Not authenticated");

    const profile = await ctx.db
      .query("profile")
      .withIndex("by_email", (q) => q.eq("email", authUser.email))
      .unique();

    if (!profile) throw new ConvexError("Profile not found");

    await ctx.db.patch(profile._id, {
      ...(args.profileImage !== undefined && {
        profileImage: args.profileImage,
      }),
      ...(args.coverImage !== undefined && {
        coverImage: args.coverImage,
      }),
    });
  },
});

// Saves the rate wizard's answers. The server derives the monthly-equivalent
// `amount` from unit/rawAmount (so clients can't send mismatched figures) and
// stamps `confirmedAt`, which freezes the rate for 6 months.
export const updateProfileRate = mutation({
  args: {
    rate: v.union(
      v.null(),
      v.object({
        unit: RATE_UNIT_SCHEMA,
        rawAmount: v.number(),
        projectDays: v.optional(v.number()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) throw new ConvexError("Not authenticated");

    const profile = await ctx.db
      .query("profile")
      .withIndex("by_email", (q) => q.eq("email", authUser.email))
      .unique();

    if (!profile) throw new ConvexError("Profile not found");

    const now = Date.now();
    if (
      profile.rate?.confirmedAt &&
      now - profile.rate.confirmedAt < RATE_LOCK_MS
    ) {
      throw new ConvexError(
        `Your rate is locked. You can update it again on ${formatDate(
          rateUnlocksAt(profile.rate.confirmedAt),
        )}.`,
      );
    }

    if (!args.rate) {
      await ctx.db.patch(profile._id, { rate: null });
      return;
    }

    const { unit, rawAmount, projectDays } = args.rate;
    if (!Number.isFinite(rawAmount) || rawAmount <= 0) {
      throw new ConvexError("Rate must be a positive number");
    }
    if (unit === "project" && (!projectDays || projectDays <= 0)) {
      throw new ConvexError("Project duration must be at least one day");
    }

    await ctx.db.patch(profile._id, {
      rate: {
        amount: monthlyEquivalent(unit, rawAmount, projectDays),
        unit,
        rawAmount,
        ...(unit === "project" && { projectDays }),
        confirmedAt: now,
      },
    });
  },
});
