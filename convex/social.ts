import { v } from "convex/values";
import { query, mutation, internalMutation, internalQuery } from "./_generated/server";

export const getConnections = query({
  args: { profileId: v.id("profiles") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("socialConnections")
      .withIndex("by_profile", (q) => q.eq("profileId", args.profileId))
      .collect();
  },
});

export const getConnectionById = query({
  args: { connectionId: v.id("socialConnections") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.connectionId);
  },
});

export const getHistory = query({
  args: { connectionId: v.id("socialConnections") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("socialAnalyticsHistory")
      .withIndex("by_connection", (q) => q.eq("connectionId", args.connectionId))
      .order("desc")
      .take(30);
  },
});

export const saveConnectionInternal = internalMutation({
  args: {
    profileId: v.id("profiles"),
    ownerType: v.union(v.literal("creator"), v.literal("brand")),
    platform: v.string(),
    handle: v.string(),
    accountId: v.string(),
    encryptedAccessToken: v.optional(v.string()),
    encryptedRefreshToken: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    verified: v.boolean(),
    followers: v.optional(v.number()),
    views: v.optional(v.number()),
    engagementRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("socialConnections")
      .withIndex("by_profile_platform", (q) =>
        q.eq("profileId", args.profileId).eq("platform", args.platform)
      )
      .unique();

    let connectionId;
    if (existing) {
      connectionId = existing._id;
      await ctx.db.patch(existing._id, {
        handle: args.handle,
        accountId: args.accountId,
        encryptedAccessToken: args.encryptedAccessToken,
        encryptedRefreshToken: args.encryptedRefreshToken,
        expiresAt: args.expiresAt,
        verified: args.verified,
        syncStatus: "success",
        lastSyncedAt: Date.now(),
        failureCount: 0,
        accountHealth: "healthy",
        lastError: undefined,
        followers: args.followers ?? existing.followers,
        views: args.views ?? existing.views,
        engagementRate: args.engagementRate ?? existing.engagementRate,
      });
    } else {
      connectionId = await ctx.db.insert("socialConnections", {
        profileId: args.profileId,
        ownerType: args.ownerType,
        platform: args.platform,
        handle: args.handle,
        accountId: args.accountId,
        encryptedAccessToken: args.encryptedAccessToken,
        encryptedRefreshToken: args.encryptedRefreshToken,
        expiresAt: args.expiresAt,
        verified: args.verified,
        syncStatus: "success",
        syncMode: "live",
        lastSyncedAt: Date.now(),
        failureCount: 0,
        accountHealth: "healthy",
        followers: args.followers,
        views: args.views,
        engagementRate: args.engagementRate,
      });
    }

    if (args.followers !== undefined) {
      await ctx.db.insert("socialAnalyticsHistory", {
        connectionId,
        timestamp: Date.now(),
        followers: args.followers,
        views: args.views,
        engagementRate: args.engagementRate,
      });
    }

    await updateProfilePlatformStats(ctx, args.profileId, args.platform, args.handle, args.followers);

    return connectionId;
  },
});

export const disconnectPlatform = mutation({
  args: {
    connectionId: v.id("socialConnections"),
  },
  handler: async (ctx, args) => {
    const connection = await ctx.db.get(args.connectionId);
    if (!connection) throw new Error("Connection not found");

    const history = await ctx.db
      .query("socialAnalyticsHistory")
      .withIndex("by_connection", (q) => q.eq("connectionId", args.connectionId))
      .collect();
    for (const record of history) {
      await ctx.db.delete(record._id);
    }

    const updates: any = {};
    if (connection.platform === "instagram") {
      updates.instagramHandle = "";
      updates.instagramFollowers = 0;
    } else if (connection.platform === "facebook") {
      updates.facebookHandle = "";
      updates.facebookFollowers = 0;
    } else if (connection.platform === "linkedin") {
      updates.linkedinHandle = "";
      updates.linkedinFollowers = 0;
    } else if (connection.platform === "youtube") {
      updates.youtubeHandle = "";
      updates.youtubeFollowers = 0;
    } else if (connection.platform === "quora") {
      updates.quoraHandle = "";
      updates.quoraFollowers = 0;
    } else if (connection.platform === "twitter") {
      updates.twitterHandle = "";
      updates.twitterFollowers = 0;
    }
    await ctx.db.patch(connection.profileId, updates);

    await ctx.db.delete(args.connectionId);
  },
});

export const markAsSyncing = internalMutation({
  args: { connectionId: v.id("socialConnections") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.connectionId, { syncStatus: "syncing" });
  },
});

export const updateConnectionStatsInternal = internalMutation({
  args: {
    connectionId: v.id("socialConnections"),
    success: v.boolean(),
    error: v.optional(v.string()),
    followers: v.optional(v.number()),
    views: v.optional(v.number()),
    engagementRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const conn = await ctx.db.get(args.connectionId);
    if (!conn) return;

    if (args.success) {
      await ctx.db.patch(args.connectionId, {
        syncStatus: "success",
        lastSyncedAt: Date.now(),
        failureCount: 0,
        accountHealth: "healthy",
        lastError: undefined,
        followers: args.followers ?? conn.followers,
        views: args.views ?? conn.views,
        engagementRate: args.engagementRate ?? conn.engagementRate,
      });

      if (args.followers !== undefined) {
        await ctx.db.insert("socialAnalyticsHistory", {
          connectionId: args.connectionId,
          timestamp: Date.now(),
          followers: args.followers,
          views: args.views,
          engagementRate: args.engagementRate,
        });

        const history = await ctx.db
          .query("socialAnalyticsHistory")
          .withIndex("by_connection", (q) => q.eq("connectionId", args.connectionId))
          .collect();
        if (history.length > 30) {
          const sorted = history.sort((a, b) => a.timestamp - b.timestamp);
          const toDelete = sorted.slice(0, history.length - 30);
          for (const item of toDelete) {
            await ctx.db.delete(item._id);
          }
        }
      }

      await updateProfilePlatformStats(
        ctx,
        conn.profileId,
        conn.platform,
        conn.handle,
        args.followers ?? conn.followers
      );
    } else {
      const failureCount = conn.failureCount + 1;
      const accountHealth = failureCount >= 5 ? "error" : failureCount >= 2 ? "warning" : "healthy";
      await ctx.db.patch(args.connectionId, {
        syncStatus: "failed",
        lastError: args.error || "Unknown error",
        failureCount,
        accountHealth,
      });
    }
  },
});

export const getVerifiedConnectionsInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("socialConnections")
      .withIndex("by_verified", (q) => q.eq("verified", true))
      .collect();
  },
});

async function updateProfilePlatformStats(
  ctx: any,
  profileId: any,
  platform: string,
  handle: string,
  followers: number | undefined
) {
  const updates: any = {};
  if (platform === "instagram") {
    updates.instagramHandle = handle;
    if (followers !== undefined) updates.instagramFollowers = followers;
  } else if (platform === "facebook") {
    updates.facebookHandle = handle;
    if (followers !== undefined) updates.facebookFollowers = followers;
  } else if (platform === "linkedin") {
    updates.linkedinHandle = handle;
    if (followers !== undefined) updates.linkedinFollowers = followers;
  } else if (platform === "youtube") {
    updates.youtubeHandle = handle;
    if (followers !== undefined) updates.youtubeFollowers = followers;
  } else if (platform === "quora") {
    updates.quoraHandle = handle;
    if (followers !== undefined) updates.quoraFollowers = followers;
  } else if (platform === "twitter") {
    updates.twitterHandle = handle;
    if (followers !== undefined) updates.twitterFollowers = followers;
  }

  if (Object.keys(updates).length > 0) {
    await ctx.db.patch(profileId, updates);
  }
}

export const getOAuthClientIds = query({
  args: {},
  handler: async (ctx) => {
    return {
      googleClientId: process.env.GOOGLE_CLIENT_ID || "",
      metaClientId: process.env.META_CLIENT_ID || "",
      linkedinClientId: process.env.LINKEDIN_CLIENT_ID || "",
      twitterClientId: process.env.TWITTER_CLIENT_ID || "",
    };
  },
});
