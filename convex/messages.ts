import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const startConversation = mutation({
  args: {
    creatorId: v.id("profiles"),
    brandId: v.id("profiles"),
    initialMessage: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if conversation already exists
    const existing = await ctx.db
      .query("conversations")
      .filter((q) =>
        q.and(
          q.eq(q.field("brandId"), args.brandId),
          q.eq(q.field("creatorId"), args.creatorId)
        )
      )
      .unique();

    let conversationId = existing?._id;

    if (!existing) {
      conversationId = await ctx.db.insert("conversations", {
        creatorId: args.creatorId,
        brandId: args.brandId,
        status: "pending",
      });
    }

    // Send initial message
    await ctx.db.insert("messages", {
      conversationId: conversationId!,
      senderId: args.brandId,
      text: args.initialMessage,
    });

    return conversationId;
  },
});

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    senderId: v.id("profiles"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: args.senderId,
      text: args.text,
    });

    // Update status to active if it was pending
    const conv = await ctx.db.get(args.conversationId);
    if (conv?.status === "pending") {
      await ctx.db.patch(args.conversationId, { status: "active" });
    }
  },
});

export const getConversations = query({
  args: { profileId: v.id("profiles"), role: v.string() },
  handler: async (ctx, args) => {
    let q = ctx.db.query("conversations");

    if (args.role === "creator") {
      q = q.withIndex("by_creator", (q) => q.eq("creatorId", args.profileId));
    } else {
      q = q.withIndex("by_brand", (q) => q.eq("brandId", args.profileId));
    }

    const conversations = await q.collect();

    // Fetch details for each conversation
    const results = await Promise.all(
      conversations.map(async (c) => {
        const otherId = args.role === "creator" ? c.brandId : c.creatorId;
        const otherProfile = await ctx.db.get(otherId);
        const messages = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) => q.eq("conversationId", c._id))
          .order("desc")
          .collect();

        const lastMessage = messages[0];

        // Count unread: messages where sender is NOT the current user
        const unreadCount = messages.filter(m => m.senderId !== args.profileId).length;

        return {
          ...c,
          otherProfile,
          lastMessage,
          unreadCount,
          isNew: c.status === "pending" && lastMessage?.senderId !== args.profileId,
        };
      })
    );

    // Filter out conversations with no messages yet (shouldn't happen but safe)
    return results.filter(r => r.lastMessage);
  },
});

export const getMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .collect();
  },
});
