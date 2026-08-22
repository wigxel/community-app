import { queryGeneric as query } from "convex/server";
import { ConvexError, v } from "convex/values";
import { Result } from "../lib/result";
import { validateUsernameFormat } from "../lib/username";
import type { Profile } from "../types/models";
import type { Id } from "./_generated/dataModel";
import { mutation } from "./_generated/server";
import { authComponent } from "./auth";

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
      filteredUsers.map(async (user) => {
        const title = user.title ? await ctx.db.get(user.title) : null;

        return {
          ...user,
          title,
        };
      }),
    );

    return enrichedUsers;
  },
});

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
    return { ...user, title };
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
      return { ...user, title };
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

    return await ctx.db.insert("profile", {
      userId: authUser._id,
      email: authUser.email,
      firstName: args.firstName,
      lastName: args.lastName,
      username,
      phoneNumbers: [],
      profileImage: null,
      coverImage: null,
      title: null,
      shortBio: "",
      links: [],
      interests: [],
      location: { city: "", country: "Nigeria" },
      skills: [],
    });
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
      firstName: args.firstName,
      lastName: args.lastName,
      phoneNumbers: args.phoneNumbers,
      ...(args.title !== undefined && { title: args.title }),
      ...(args.shortBio !== undefined && { shortBio: args.shortBio }),
      ...(args.profileImage !== undefined && {
        profileImage: args.profileImage,
      }),
      ...(args.coverImage !== undefined && {
        coverImage: args.coverImage,
      }),
      ...(args.interests !== undefined && { interests: args.interests }),
      ...(args.location !== undefined && { location: args.location }),
      ...(args.links !== undefined && { links: args.links }),
      ...(args.skills !== undefined && { skills: args.skills }),
    });

    return profile._id;
  },
});
