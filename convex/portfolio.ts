import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getByProfile = query({
  args: { profileId: v.id("profiles") },
  handler: async (ctx, args) => {
    const images = await ctx.db
      .query("portfolioImages")
      .withIndex("by_profile", (q) => q.eq("profileId", args.profileId))
      .order("asc")
      .collect();
    
    return Promise.all(
      images.map(async (img) => ({
        ...img,
        url: await ctx.storage.getUrl(img.imageStorageId),
      }))
    );
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const addImage = mutation({
  args: {
    profileId: v.id("profiles"),
    imageStorageId: v.string(),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("portfolioImages", {
      profileId: args.profileId,
      imageStorageId: args.imageStorageId,
      sortOrder: args.sortOrder,
    });
  },
});

export const removeImage = mutation({
  args: { id: v.id("portfolioImages") },
  handler: async (ctx, args) => {
    const img = await ctx.db.get(args.id);
    if (img) {
      await ctx.storage.delete(img.imageStorageId);
      await ctx.db.delete(args.id);
    }
  },
});
