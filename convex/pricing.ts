import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getByProfile = query({
  args: { profileId: v.id("profiles") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pricingTiers")
      .withIndex("by_profile", (q) => q.eq("profileId", args.profileId))
      .order("asc")
      .collect();
  },
});

export const upsertMany = mutation({
  args: {
    profileId: v.id("profiles"),
    tiers: v.array(
      v.object({
        id: v.optional(v.id("pricingTiers")),
        name: v.string(),
        price: v.number(),
        sortOrder: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const tier of args.tiers) {
      if (tier.id) {
        await ctx.db.patch(tier.id, {
          name: tier.name,
          price: tier.price,
          sortOrder: tier.sortOrder,
        });
      } else {
        await ctx.db.insert("pricingTiers", {
          profileId: args.profileId,
          name: tier.name,
          price: tier.price,
          sortOrder: tier.sortOrder,
        });
      }
    }
  },
});

export const remove = mutation({
  args: { id: v.id("pricingTiers") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
