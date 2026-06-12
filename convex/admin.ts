import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/* ───────────────────── Aggregate stats ───────────────────── */
export const stats = query({
  args: {},
  handler: async (ctx) => {
    const profiles = await ctx.db.query("profiles").collect();
    const conversations = await ctx.db.query("conversations").collect();
    const messages = await ctx.db.query("messages").collect();
    const favorites = await ctx.db.query("favorites").collect();

    return {
      totalUsers: profiles.length,
      creators: profiles.filter((p) => p.role === "creator").length,
      brands: profiles.filter((p) => p.role === "brand").length,
      conversations: conversations.length,
      messages: messages.length,
      favorites: favorites.length,
    };
  },
});

/* ───────────────── List all conversations ────────────────── */
export const listAllConversations = query({
  args: {},
  handler: async (ctx) => {
    const conversations = await ctx.db.query("conversations").collect();

    const results = await Promise.all(
      conversations.map(async (c) => {
        const creator = await ctx.db.get(c.creatorId);
        const brand = await ctx.db.get(c.brandId);

        const messages = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) => q.eq("conversationId", c._id))
          .order("desc")
          .collect();

        const lastMessage = messages[0] ?? null;

        return {
          ...c,
          creator,
          brand,
          lastMessage,
          messageCount: messages.length,
        };
      }),
    );

    return results;
  },
});

/* ──────────── List all messages for a conversation ─────────── */
export const listMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .order("asc")
      .collect();

    const withSender = await Promise.all(
      messages.map(async (m) => {
        const sender = await ctx.db.get(m.senderId);
        return { ...m, sender };
      }),
    );

    let creator = null;
    let brand = null;
    if (conversation) {
      creator = await ctx.db.get(conversation.creatorId);
      brand = await ctx.db.get(conversation.brandId);
    }

    return { conversation, creator, brand, messages: withSender };
  },
});

/* ──────────────── Delete profile (cascade) ─────────────── */
export const deleteProfile = mutation({
  args: { id: v.id("profiles") },
  handler: async (ctx, args) => {
    // Delete pricing tiers
    const tiers = await ctx.db
      .query("pricingTiers")
      .withIndex("by_profile", (q) => q.eq("profileId", args.id))
      .collect();
    for (const t of tiers) await ctx.db.delete(t._id);

    // Delete portfolio images (and their storage)
    const images = await ctx.db
      .query("portfolioImages")
      .withIndex("by_profile", (q) => q.eq("profileId", args.id))
      .collect();
    for (const img of images) {
      try {
        await ctx.storage.delete(img.imageStorageId);
      } catch {
        // Storage item may already be gone
      }
      await ctx.db.delete(img._id);
    }

    // Delete favorites where this profile is the brand
    const favsBrand = await ctx.db
      .query("favorites")
      .withIndex("by_brand", (q) => q.eq("brandId", args.id))
      .collect();
    for (const f of favsBrand) await ctx.db.delete(f._id);

    // Delete favorites where this profile is the creator (creatorId is string)
    const allFavs = await ctx.db.query("favorites").collect();
    for (const f of allFavs) {
      if (f.creatorId === args.id) await ctx.db.delete(f._id);
    }

    // Delete conversations where profile is creator or brand
    const convsCreator = await ctx.db
      .query("conversations")
      .withIndex("by_creator", (q) => q.eq("creatorId", args.id))
      .collect();
    const convsBrand = await ctx.db
      .query("conversations")
      .withIndex("by_brand", (q) => q.eq("brandId", args.id))
      .collect();

    const convIds = new Set([
      ...convsCreator.map((c) => c._id),
      ...convsBrand.map((c) => c._id),
    ]);

    for (const convId of convIds) {
      const msgs = await ctx.db
        .query("messages")
        .withIndex("by_conversation", (q) => q.eq("conversationId", convId))
        .collect();
      for (const m of msgs) await ctx.db.delete(m._id);
      await ctx.db.delete(convId);
    }

    // Delete the profile itself
    await ctx.db.delete(args.id);
  },
});

/* ───────────── Delete conversation + messages ────────────── */
export const deleteConversation = mutation({
  args: { id: v.id("conversations") },
  handler: async (ctx, args) => {
    const msgs = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.id))
      .collect();
    for (const m of msgs) await ctx.db.delete(m._id);
    await ctx.db.delete(args.id);
  },
});

/* ───────────────── Update profile role ───────────────────── */
export const updateProfileRole = mutation({
  args: {
    id: v.id("profiles"),
    role: v.union(v.literal("creator"), v.literal("brand")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { role: args.role });
  },
});
