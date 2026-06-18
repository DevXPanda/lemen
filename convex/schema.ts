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
    website: v.optional(v.string()),
    companySize: v.optional(v.string()),
    // Verification fields
    verificationStatus: v.optional(v.string()), // "unverified" | "pending" | "verified" | "rejected"
    aadharUrl: v.optional(v.string()),
    panUrl: v.optional(v.string()),
    aadharStorageId: v.optional(v.string()),
    panStorageId: v.optional(v.string()),
    gstNumber: v.optional(v.string()),
    gstCertificateUrl: v.optional(v.string()),
    gstCertificateStorageId: v.optional(v.string()),
    // Suspension fields
    isSuspended: v.optional(v.boolean()),
    suspensionReason: v.optional(v.string()),
    suspendedUntil: v.optional(v.number()),
  }).index("by_userId", ["userId"]),

  campaigns: defineTable({
    brandId: v.id("profiles"),
    title: v.string(),
    budget: v.string(),
    category: v.string(),
    duration: v.string(),
    active: v.boolean(),
    createdAt: v.number(),
  }).index("by_brand", ["brandId"]),

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
    status: v.union(
      v.literal("pending"),
      v.literal("active"),
      v.literal("completed"),
    ),
    archived: v.optional(v.boolean()),
  })
    .index("by_creator", ["creatorId"])
    .index("by_brand", ["brandId"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("profiles"),
    text: v.string(),
    read: v.optional(v.boolean()),
  }).index("by_conversation", ["conversationId"]),

  otps: defineTable({
    email: v.string(),
    codeHash: v.string(),
    expiresAt: v.number(),
  }).index("by_email", ["email"]),

  favorites: defineTable({
    brandId: v.id("profiles"),
    creatorId: v.string(),
  })
    .index("by_brand", ["brandId"])
    .index("by_brand_creator", ["brandId", "creatorId"]),

  resetTokens: defineTable({
    email: v.string(),
    token: v.string(),
    expiresAt: v.number(),
  }).index("by_token", ["token"]),

  reviews: defineTable({
    creatorId: v.id("profiles"),
    brandId: v.id("profiles"),
    conversationId: v.id("conversations"),
    rating: v.number(),
    title: v.string(),
    text: v.string(),
    campaignRef: v.optional(v.string()),
    visible: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_creator", ["creatorId"])
    .index("by_creator_visible", ["creatorId", "visible"])
    .index("by_brand", ["brandId"])
    .index("by_conversation", ["conversationId"]),

  connections: defineTable({
    creatorId: v.id("profiles"),
    brandId: v.id("profiles"),
    pitch: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected"),
    ),
    creatorNotificationSeen: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_creator", ["creatorId"])
    .index("by_brand", ["brandId"])
    .index("by_creator_brand", ["creatorId", "brandId"]),

  socialConnections: defineTable({
    profileId: v.id("profiles"),
    ownerType: v.union(v.literal("creator"), v.literal("brand")),
    platform: v.string(),
    handle: v.string(),
    accountId: v.string(),
    encryptedAccessToken: v.optional(v.string()),
    encryptedRefreshToken: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    verified: v.boolean(),
    lastSyncedAt: v.optional(v.number()),
    syncStatus: v.union(v.literal("success"), v.literal("failed"), v.literal("syncing")),
    syncMode: v.union(v.literal("live"), v.literal("manual")),
    lastError: v.optional(v.string()),
    failureCount: v.number(),
    accountHealth: v.union(v.literal("healthy"), v.literal("warning"), v.literal("error")),
    followers: v.optional(v.number()),
    subscribers: v.optional(v.number()),
    views: v.optional(v.number()),
    engagementRate: v.optional(v.number()),
  })
    .index("by_profile", ["profileId"])
    .index("by_profile_platform", ["profileId", "platform"])
    .index("by_verified", ["verified"]),

  socialAnalyticsHistory: defineTable({
    connectionId: v.id("socialConnections"),
    timestamp: v.number(),
    followers: v.number(),
    views: v.optional(v.number()),
    engagementRate: v.optional(v.number()),
    metadata: v.optional(v.string()),
  })
    .index("by_connection", ["connectionId"])
    .index("by_connection_time", ["connectionId", "timestamp"]),
});
