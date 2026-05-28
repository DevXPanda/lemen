import { v, ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { 
    search: v.optional(v.string()),
    category: v.optional(v.string()),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("profiles");
    
    // Simple filter for creator role
    if (args.role) {
      q = q.filter((q) => q.eq(q.field("role"), args.role));
    }

    let profiles = await q.collect();

    // Client-side search for now (Convex search indexes can be added later)
    if (args.search) {
      const s = args.search.toLowerCase();
      profiles = profiles.filter((p) => 
        p.fullName.toLowerCase().includes(s) || 
        p.handle?.toLowerCase().includes(s) || 
        p.category?.toLowerCase().includes(s)
      );
    }

    return profiles;
  },
});

export const getByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

export const getById = query({
  args: { id: v.id("profiles") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    userId: v.string(),
    fullName: v.string(),
    role: v.union(v.literal("creator"), v.literal("brand")),
    isLogin: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    
    if (args.isLogin) {
      if (!existing) {
        throw new ConvexError("This email is not registered. Please create an account first.");
      }
      if (existing.role !== args.role) {
        throw new ConvexError(`This account is registered as a ${existing.role}. Please log in as a ${existing.role}.`);
      }
      return existing._id;
    }

    // Signup flow
    if (existing) {
      return existing._id; // Or throw if we want to prevent double registration
    }

    return await ctx.db.insert("profiles", {
      userId: args.userId,
      fullName: args.fullName,
      role: args.role,
      profileViews: 0,
      clicks: 0,
      bookings: 0,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("profiles"),
    fullName: v.optional(v.string()),
    handle: v.optional(v.string()),
    category: v.optional(v.string()),
    location: v.optional(v.string()),
    bio: v.optional(v.string()),
    startingPrice: v.optional(v.number()),
    avatarUrl: v.optional(v.string()),
    coverUrl: v.optional(v.string()),
    // Stats
    profileViews: v.optional(v.number()),
    clicks: v.optional(v.number()),
    bookings: v.optional(v.number()),
    // Socials
    instagramHandle: v.optional(v.string()),
    instagramFollowers: v.optional(v.number()),
    facebookHandle: v.optional(v.string()),
    facebookFollowers: v.optional(v.number()),
    linkedinHandle: v.optional(v.string()),
    linkedinFollowers: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const setAvatarImage = mutation({
  args: {
    id: v.id("profiles"),
    imageStorageId: v.string(),
  },
  handler: async (ctx, args) => {
    const avatarUrl = await ctx.storage.getUrl(args.imageStorageId);
    await ctx.db.patch(args.id, { avatarUrl: avatarUrl ?? undefined });
    return avatarUrl;
  },
});

export const setCoverImage = mutation({
  args: {
    id: v.id("profiles"),
    imageStorageId: v.string(),
  },
  handler: async (ctx, args) => {
    const coverUrl = await ctx.storage.getUrl(args.imageStorageId);
    await ctx.db.patch(args.id, { coverUrl: coverUrl ?? undefined });
    return coverUrl;
  },
});
