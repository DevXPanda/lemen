import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seed = mutation({
  args: {
    influencers: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        handle: v.string(),
        category: v.string(),
        followers: v.number(),
        startingPrice: v.number(),
        location: v.string(),
        rating: v.number(),
        reviews: v.number(),
        available: v.boolean(),
        avatar: v.string(),
        cover: v.string(),
        bio: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const inf of args.influencers) {
      const profileId = await ctx.db.insert("profiles", {
        userId: `mock_${inf.id}`,
        fullName: inf.name,
        handle: inf.handle,
        category: inf.category,
        location: inf.location,
        bio: inf.bio,
        role: "creator",
        startingPrice: inf.startingPrice,
        avatarUrl: inf.avatar,
      });

      // Add default pricing tiers
      await ctx.db.insert("pricingTiers", {
        profileId,
        name: "Story",
        price: Math.round(inf.startingPrice * 0.4),
        sortOrder: 0,
      });
      await ctx.db.insert("pricingTiers", {
        profileId,
        name: "Post",
        price: inf.startingPrice,
        sortOrder: 1,
      });
      await ctx.db.insert("pricingTiers", {
        profileId,
        name: "Reel",
        price: Math.round(inf.startingPrice * 1.5),
        sortOrder: 2,
      });
    }
  },
});
