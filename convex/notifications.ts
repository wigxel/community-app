import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

// 1. The shared internal emitter (only the backend can call this)
export const create = internalMutation({
  args: {
    userId: v.string(),
    type: v.union(v.literal("welcome"), v.literal("security")),
    title: v.string(),
    body: v.optional(v.string()),
    href: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      title: args.title,
      body: args.body,
      href: args.href,
    });
  },
});

// 2. Paginated list, scoped to the logged-in user
export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    return await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", authUser._id))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

// 3. Get unread count for the sidebar badge
export const unreadCount = query({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) return 0;

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_userId_readAt", (q) =>
        q.eq("userId", authUser._id).eq("readAt", undefined),
      )
      .collect();

    return unread.length;
  },
});

// 4. Mark a single notification as read
export const markRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) throw new Error("Not authenticated");

    const notification = await ctx.db.get(args.id);
    if (!notification) throw new Error("Notification not found");

    // Security check: ensure the user actually owns this notification
    if (notification.userId !== authUser._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.id, { readAt: Date.now() });
  },
});

// 5. Mark all notifications as read
export const markAllRead = mutation({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) throw new Error("Not authenticated");

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_userId_readAt", (q) =>
        q.eq("userId", authUser._id).eq("readAt", undefined),
      )
      .collect();

    const now = Date.now();
    for (const notification of unread) {
      await ctx.db.patch(notification._id, { readAt: now });
    }
  },
});
