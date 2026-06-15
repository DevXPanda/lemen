import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getByBrand = query({
  args: { brandId: v.id("profiles") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("campaigns")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .order("desc")
      .collect();
  },
});

export const getActiveByBrand = query({
  args: { brandId: v.id("profiles") },
  handler: async (ctx, args) => {
    const campaigns = await ctx.db
      .query("campaigns")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .order("desc")
      .collect();
    return campaigns.filter((c) => c.active === true);
  },
});

export const create = mutation({
  args: {
    brandId: v.id("profiles"),
    title: v.string(),
    budget: v.string(),
    category: v.string(),
    duration: v.string(),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("campaigns", {
      brandId: args.brandId,
      title: args.title,
      budget: args.budget,
      category: args.category,
      duration: args.duration,
      active: args.active,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("campaigns"),
    title: v.optional(v.string()),
    budget: v.optional(v.string()),
    category: v.optional(v.string()),
    duration: v.optional(v.string()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("campaigns") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
