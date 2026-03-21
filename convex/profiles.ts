// import { queryGeneric as query } from "convex/server";
// import { v } from "convex/values";

// // Query to list users with optional filters
// export const listProfile = query({
//   args: {
//     titleId: v.optional(v.id("titles")),
//     searchTerm: v.optional(v.string()),
//   },
//   async handler(ctx, args) {
//     let usersQuery = ctx.db.query("profile");

//     if (args.titleId) {
//       usersQuery = usersQuery.filter((q) =>
//         q.eq(q.field("title"), args.titleId),
//       );
//     }

//     const users = await usersQuery.collect();

//     // Filter by search term if provided
//     let filteredUsers = users;
//     if (args.searchTerm) {
//       const searchLower = args.searchTerm.toLowerCase();
//       filteredUsers = users.filter((user) => {
//         const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
//         return (
//           fullName.includes(searchLower) ||
//           user.email.toLowerCase().includes(searchLower)
//         );
//       });
//     }

//     // Enrich with role information
//     const enrichedUsers = await Promise.all(
//       filteredUsers.map(async (user) => {
//         const title = await ctx.db.get(user.title);
//         return {
//           ...user,
//           title: title,
//         };
//       }),
//     );

//     return enrichedUsers;
//   },
// });

// // Query to retrieve user by username
// export const getProfileByUsername = query({
//   args: { username: v.string() },
//   async handler(ctx, args) {
//     const user = await ctx.db
//       .query("profile")
//       .withIndex("by_username", (q) =>
//         q.eq("username", args.username.toLowerCase()),
//       )
//       .unique();

//     if (!user) {
//       return null;
//     }

//     // Enrich with role information
//     const title = await ctx.db.get(user.title);
//     return {
//       ...user,
//       title: title,
//     };
//   },
// });

// export const getProfile = query({
//   args: {},
//   async handler(ctx) {
//     const identity = await ctx.auth.getUserIdentity();

//     if (identity === null) {
//       throw new Error("Not authenticated");
//     }

//     const user = await ctx.db
//       .query("profile")
//       .filter((q) => q.eq(q.field("email"), identity?.email))
//       .unique();

//     if (!user) {
//       return null;
//     }

//     // Enrich with role information
//     return await ctx.db
//       .get(user.title)
//       .then((title) => {
//         return {
//           ...user,
//           title: title,
//         };
//       })
//       .catch(() => {
//         return { ...user, title: null };
//       });
//   },
// });

// export const getForCurrentUser = query({
//   args: {},
//   handler: async (ctx) => {
//     const identity = await ctx.auth.getUserIdentity();

//     if (identity === null) {
//       throw new Error("Not authenticated");
//     }

//     return await ctx.db
//       .query("profile")
//       .filter((q) => q.eq(q.field("email"), identity.email))
//       .unique();
//   },
// });

import { queryGeneric as query } from "convex/server";
import { v } from "convex/values";

// Query to list users with optional filters
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

    // Filter by search term if provided
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

    // Enrich with title information safely
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

// Query to retrieve user by username
export const getProfileByUsername = query({
  args: { username: v.string() },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("profile")
      .withIndex("by_username", (q) =>
        q.eq("username", args.username.toLowerCase()),
      )
      .unique();

    if (!user) {
      return null;
    }

    const title = user.title ? await ctx.db.get(user.title) : null;

    return {
      ...user,
      title,
    };
  },
});

export const getProfile = query({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      // return null instead of throwing while auth is still loading
      return null;
    }

    const user = await ctx.db
      .query("profile")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .unique();

    if (!user) {
      return null;
    }

    const title = user.title ? await ctx.db.get(user.title) : null;

    return {
      ...user,
      title,
    };
  },
});

export const getForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("profile")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .unique();
  },
});
