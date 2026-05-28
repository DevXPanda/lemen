import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  profiles: defineTable({
    userId: v.string(), // External ID (e.g. from Clerk/Auth0) or internal reference
    fullName: v.string(),
    handle: v.optional(v.string()),
    category: v.optional(v.string()),
    location: v.optional(v.string()),
    bio: v.optional(v.string()),
    role: v.union(v.literal("creator"), v.literal("brand")),
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
  }).index("by_userId", ["userId"]),

  pricingTiers: defineTable({
    profileId: v.id("profiles"),
    name: v.string(),
    price: v.number(),
    sortOrder: v.number(),
  }).index("by_profile", ["profileId"]),

  portfolioImages: defineTable({
    profileId: v.id("profiles"),
    imageStorageId: v.string(), // Convex Storage ID
    sortOrder: v.number(),
  }).index("by_profile", ["profileId"]),

  conversations: defineTable({
    creatorId: v.id("profiles"),
    brandId: v.id("profiles"),
    status: v.union(v.literal("pending"), v.literal("active"), v.literal("completed")),
  }).index("by_creator", ["creatorId"])
    .index("by_brand", ["brandId"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("profiles"),
    text: v.string(),
  }).index("by_conversation", ["conversationId"]),
});
