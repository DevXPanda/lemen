import { v, ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";

export const canReview = query({
  args: {
    creatorId: v.id("profiles"),
    brandId: v.optional(v.id("profiles")),
  },
  handler: async (ctx, args) => {
    const brandId = args.brandId;
    if (!brandId) {
      return { canReview: false };
    }

    // Verify brandId exists and has the brand role
    const brand = await ctx.db.get(brandId);
    if (!brand || brand.role !== "brand") {
      return { canReview: false };
    }

    // Find all conversations between the brand and the creator
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_brand", (q) => q.eq("brandId", brandId))
      .filter((q) => q.eq(q.field("creatorId"), args.creatorId))
      .collect();

    if (conversations.length === 0) {
      return { canReview: false };
    }

    // Check if there is at least one conversation that hasn't been reviewed yet
    for (const conv of conversations) {
      const existingReview = await ctx.db
        .query("reviews")
        .withIndex("by_conversation", (q) => q.eq("conversationId", conv._id))
        .unique();

      if (!existingReview) {
        // Found a conversation/collaboration that hasn't been reviewed yet!
        return { canReview: true, conversationId: conv._id };
      }
    }

    return { canReview: false };
  },
});

export const submitReview = mutation({
  args: {
    creatorId: v.id("profiles"),
    brandId: v.id("profiles"),
    conversationId: v.id("conversations"),
    rating: v.number(),
    title: v.string(),
    text: v.string(),
    campaignRef: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Validate role of reviewer
    const brand = await ctx.db.get(args.brandId);
    if (!brand || brand.role !== "brand") {
      throw new ConvexError("Only authenticated Brands can submit reviews.");
    }

    // 2. Validate role of target creator
    const creator = await ctx.db.get(args.creatorId);
    if (!creator || creator.role !== "creator") {
      throw new ConvexError("Reviews can only be submitted for Creators.");
    }

    // 3. Verify conversation/collaboration matches
    const conv = await ctx.db.get(args.conversationId);
    if (!conv || conv.brandId !== args.brandId || conv.creatorId !== args.creatorId) {
      throw new ConvexError("Invalid collaboration reference.");
    }

    // 4. Ensure each collaboration is reviewed only once
    const existingReview = await ctx.db
      .query("reviews")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .unique();

    if (existingReview) {
      throw new ConvexError("This collaboration has already been reviewed.");
    }

    // 5. Validate rating ranges
    if (args.rating < 1 || args.rating > 5) {
      throw new ConvexError("Rating must be between 1 and 5 stars.");
    }

    // 6. Insert review
    const reviewId = await ctx.db.insert("reviews", {
      creatorId: args.creatorId,
      brandId: args.brandId,
      conversationId: args.conversationId,
      rating: args.rating,
      title: args.title,
      text: args.text,
      campaignRef: args.campaignRef,
      visible: true, // Visible by default
      createdAt: Date.now(),
    });

    return reviewId;
  },
});

export const listReviewsForCreator = query({
  args: {
    creatorId: v.id("profiles"),
    visibleOnly: v.boolean(),
  },
  handler: async (ctx, args) => {
    let reviewsQuery = ctx.db
      .query("reviews")
      .withIndex("by_creator", (q) => q.eq("creatorId", args.creatorId));

    const reviews = await reviewsQuery.collect();

    // Filter by visibility if requested
    const filteredReviews = args.visibleOnly
      ? reviews.filter((r) => r.visible)
      : reviews;

    // Join with Brand Profile to get reviewer name, avatar, etc.
    const results = await Promise.all(
      filteredReviews.map(async (r) => {
        const brandProfile = await ctx.db.get(r.brandId);
        return {
          ...r,
          brandName: brandProfile?.fullName || "Anonymous Brand",
          brandAvatar: brandProfile?.avatarUrl,
        };
      })
    );

    return results;
  },
});

export const getAverageRating = query({
  args: {
    creatorId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_creator_visible", (q) =>
        q.eq("creatorId", args.creatorId).eq("visible", true)
      )
      .collect();

    if (reviews.length === 0) {
      return { rating: 5.0, reviewsCount: 0 };
    }

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = Math.round((totalRating / reviews.length) * 10) / 10; // 1 decimal place

    return {
      rating: avgRating,
      reviewsCount: reviews.length,
    };
  },
});

export const toggleReviewVisibility = mutation({
  args: {
    reviewId: v.id("reviews"),
    creatorId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new ConvexError("Review not found.");
    }

    // Verify ownership: only the creator of the review profile can toggle visibility
    if (review.creatorId !== args.creatorId) {
      throw new ConvexError("Unauthorized operation.");
    }

    await ctx.db.patch(args.reviewId, {
      visible: !review.visible,
    });

    return { visible: !review.visible };
  },
});
