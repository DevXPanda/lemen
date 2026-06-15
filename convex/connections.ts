import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const sendRequest = mutation({
  args: {
    creatorId: v.id("profiles"),
    brandId: v.id("profiles"),
    pitch: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if a connection already exists
    const existing = await ctx.db
      .query("connections")
      .withIndex("by_creator_brand", (q) =>
        q.eq("creatorId", args.creatorId).eq("brandId", args.brandId)
      )
      .unique();

    if (existing) {
      throw new Error("Connection request already exists between you.");
    }

    const connectionId = await ctx.db.insert("connections", {
      creatorId: args.creatorId,
      brandId: args.brandId,
      pitch: args.pitch,
      status: "pending",
      creatorNotificationSeen: false,
      createdAt: Date.now(),
    });

    return connectionId;
  },
});

export const acceptRequest = mutation({
  args: {
    connectionId: v.id("connections"),
  },
  handler: async (ctx, args) => {
    const connection = await ctx.db.get(args.connectionId);
    if (!connection) {
      throw new Error("Connection request not found.");
    }

    if (connection.status !== "pending") {
      throw new Error("Connection request is not pending.");
    }

    // Update connection status
    await ctx.db.patch(args.connectionId, {
      status: "accepted",
      creatorNotificationSeen: false,
    });

    // Check if conversation already exists
    const existingConv = await ctx.db
      .query("conversations")
      .filter((q) =>
        q.and(
          q.eq(q.field("brandId"), connection.brandId),
          q.eq(q.field("creatorId"), connection.creatorId)
        )
      )
      .unique();

    let conversationId = existingConv?._id;

    if (!existingConv) {
      conversationId = await ctx.db.insert("conversations", {
        creatorId: connection.creatorId,
        brandId: connection.brandId,
        status: "active",
      });
    } else {
      await ctx.db.patch(existingConv._id, { status: "active" });
    }

    // Insert the pitch message as the first message
    await ctx.db.insert("messages", {
      conversationId: conversationId!,
      senderId: connection.creatorId,
      text: connection.pitch,
      read: false,
    });

    return conversationId;
  },
});

export const rejectRequest = mutation({
  args: {
    connectionId: v.id("connections"),
  },
  handler: async (ctx, args) => {
    const connection = await ctx.db.get(args.connectionId);
    if (!connection) {
      throw new Error("Connection request not found.");
    }

    if (connection.status !== "pending") {
      throw new Error("Connection request is not pending.");
    }

    // Update connection status
    await ctx.db.patch(args.connectionId, {
      status: "rejected",
      creatorNotificationSeen: false,
    });
  },
});

export const getNavbarNotificationCount = query({
  args: {
    profileId: v.id("profiles"),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.role === "brand") {
      // Brands count pending incoming connection requests
      const pending = await ctx.db
        .query("connections")
        .withIndex("by_brand", (q) => q.eq("brandId", args.profileId))
        .filter((q) => q.eq(q.field("status"), "pending"))
        .collect();
      return pending.length;
    } else if (args.role === "creator") {
      // Creators count unseen decisions (accepted/rejected)
      const unseen = await ctx.db
        .query("connections")
        .withIndex("by_creator", (q) => q.eq("creatorId", args.profileId))
        .filter((q) =>
          q.and(
            q.eq(q.field("creatorNotificationSeen"), false),
            q.or(
              q.eq(q.field("status"), "accepted"),
              q.eq(q.field("status"), "rejected")
            )
          )
        )
        .collect();
      return unseen.length;
    }
    return 0;
  },
});

export const getRequestsForBrand = query({
  args: {
    brandId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const requests = await ctx.db
      .query("connections")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    return await Promise.all(
      requests.map(async (req) => {
        const creatorProfile = await ctx.db.get(req.creatorId);
        return {
          ...req,
          creatorProfile,
        };
      })
    );
  },
});

export const getRequestsForCreator = query({
  args: {
    creatorId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const requests = await ctx.db
      .query("connections")
      .withIndex("by_creator", (q) => q.eq("creatorId", args.creatorId))
      .collect();

    return await Promise.all(
      requests.map(async (req) => {
        const brandProfile = await ctx.db.get(req.brandId);
        return {
          ...req,
          brandProfile,
        };
      })
    );
  },
});

export const getConnectionStatus = query({
  args: {
    creatorId: v.id("profiles"),
    brandId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("connections")
      .withIndex("by_creator_brand", (q) =>
        q.eq("creatorId", args.creatorId).eq("brandId", args.brandId)
      )
      .unique();
  },
});

export const markCreatorNotificationsSeen = mutation({
  args: {
    creatorId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const unseen = await ctx.db
      .query("connections")
      .withIndex("by_creator", (q) => q.eq("creatorId", args.creatorId))
      .filter((q) =>
        q.and(
          q.eq(q.field("creatorNotificationSeen"), false),
          q.or(
            q.eq(q.field("status"), "accepted"),
            q.eq(q.field("status"), "rejected")
          )
        )
      )
      .collect();

    for (const req of unseen) {
      await ctx.db.patch(req._id, { creatorNotificationSeen: true });
    }
  },
});

export const getAllConnections = query({
  args: {
    profileId: v.id("profiles"),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.role === "brand") {
      const list = await ctx.db
        .query("connections")
        .withIndex("by_brand", (q) => q.eq("brandId", args.profileId))
        .collect();
      return await Promise.all(
        list.map(async (req) => {
          const otherProfile = await ctx.db.get(req.creatorId);
          return {
            ...req,
            otherProfile,
          };
        })
      );
    } else {
      const list = await ctx.db
        .query("connections")
        .withIndex("by_creator", (q) => q.eq("creatorId", args.profileId))
        .collect();
      return await Promise.all(
        list.map(async (req) => {
          const otherProfile = await ctx.db.get(req.brandId);
          return {
            ...req,
            otherProfile,
          };
        })
      );
    }
  },
});

