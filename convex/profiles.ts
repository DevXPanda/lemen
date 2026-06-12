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
      profiles = profiles.filter(
        (p) =>
          p.fullName.toLowerCase().includes(s) ||
          p.handle?.toLowerCase().includes(s) ||
          p.category?.toLowerCase().includes(s),
      );
    }

    const results = await Promise.all(
      profiles.map(async (p) => {
        const reviews = await ctx.db
          .query("reviews")
          .withIndex("by_creator_visible", (q) =>
            q.eq("creatorId", p._id).eq("visible", true)
          )
          .collect();

        if (reviews.length === 0) {
          return {
            ...p,
            rating: 5.0,
            reviewsCount: 0,
          };
        }

        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = Math.round((totalRating / reviews.length) * 10) / 10;

        return {
          ...p,
          rating: avgRating,
          reviewsCount: reviews.length,
        };
      })
    );

    return results;
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
    const profile = await ctx.db.get(args.id);
    if (!profile) return null;

    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_creator_visible", (q) =>
        q.eq("creatorId", profile._id).eq("visible", true)
      )
      .collect();

    const rating =
      reviews.length === 0
        ? 5.0
        : Math.round(
            (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) *
              10,
          ) / 10;
    const reviewsCount = reviews.length;

    return {
      ...profile,
      rating,
      reviewsCount,
    };
  },
});

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const webCrypto =
    typeof crypto !== "undefined"
      ? crypto
      : (globalThis as unknown as { crypto: Crypto }).crypto;
  const hashBuffer = await webCrypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const create = mutation({
  args: {
    userId: v.string(),
    fullName: v.string(),
    role: v.union(v.literal("creator"), v.literal("brand")),
    isLogin: v.boolean(),
    email: v.optional(v.string()),
    otpCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (args.isLogin) {
      if (!existing) {
        throw new ConvexError(
          "This email is not registered. Please create an account first.",
        );
      }
      if (existing.role !== args.role) {
        throw new ConvexError(
          `This account is registered as a ${existing.role}. Please log in as a ${existing.role}.`,
        );
      }
      return existing._id;
    }

    // Signup flow
    if (existing) {
      return existing._id; // Or throw if we want to prevent double registration
    }

    // Validate OTP
    if (!args.email || !args.otpCode) {
      throw new ConvexError(
        "Email and verification code are required for registration.",
      );
    }

    const email = args.email;
    const otpCode = args.otpCode;

    const otpRecord = await ctx.db
      .query("otps")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (!otpRecord) {
      throw new ConvexError(
        "No verification code request was found for this email.",
      );
    }

    if (Date.now() > otpRecord.expiresAt) {
      throw new ConvexError(
        "Verification code has expired. Please request a new one.",
      );
    }

    const inputHash = await sha256(otpCode);
    if (inputHash !== otpRecord.codeHash) {
      throw new ConvexError("Invalid verification code. Please try again.");
    }

    // Delete the verified OTP record to prevent reuse
    await ctx.db.delete(otpRecord._id);

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
    youtubeHandle: v.optional(v.string()),
    youtubeFollowers: v.optional(v.number()),
    quoraHandle: v.optional(v.string()),
    quoraFollowers: v.optional(v.number()),
    twitterHandle: v.optional(v.string()),
    twitterFollowers: v.optional(v.number()),
    // Brand preferences
    prefNiches: v.optional(v.string()),
    prefBudget: v.optional(v.string()),
    prefReach: v.optional(v.string()),
    prefRegions: v.optional(v.string()),
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

export const toggleFavorite = mutation({
  args: {
    brandId: v.id("profiles"),
    creatorId: v.string(),
  },
  handler: async (ctx, args) => {
    const brand = await ctx.db.get(args.brandId);
    if (!brand || brand.role !== "brand") {
      throw new ConvexError("Only brands can save creators.");
    }

    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_brand_creator", (q) =>
        q.eq("brandId", args.brandId).eq("creatorId", args.creatorId),
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { isFavorite: false };
    } else {
      await ctx.db.insert("favorites", {
        brandId: args.brandId,
        creatorId: args.creatorId,
      });
      return { isFavorite: true };
    }
  },
});

export const isFavorite = query({
  args: {
    brandId: v.optional(v.id("profiles")),
    creatorId: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.brandId) return false;
    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_brand_creator", (q) =>
        q.eq("brandId", args.brandId!).eq("creatorId", args.creatorId),
      )
      .unique();
    return !!existing;
  },
});

export const getFavorites = query({
  args: {
    brandId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const favs = await ctx.db
      .query("favorites")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .collect();

    const results = [];
    for (const fav of favs) {
      let profile = null;
      try {
        const profileId = ctx.db.normalizeId("profiles", fav.creatorId);
        if (profileId) {
          profile = await ctx.db.get(profileId);
        }
      } catch (e) {
        // Ignore normalization / fetch error
      }

      if (profile) {
        results.push({
          id: fav.creatorId,
          name: profile.fullName,
          avatar:
            profile.avatarUrl ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.fullName}`,
          category: profile.category || "General",
          followers:
            (profile.instagramFollowers || 0) +
            (profile.facebookFollowers || 0) +
            (profile.linkedinFollowers || 0) +
            (profile.youtubeFollowers || 0) +
            (profile.quoraFollowers || 0) +
            (profile.twitterFollowers || 0),
          isLive: true,
        });
      } else {
        results.push({
          id: fav.creatorId,
          isLive: false,
        });
      }
    }
    return results;
  },
});
