import { v, ConvexError } from "convex/values";
import { mutation, internalMutation } from "./_generated/server";

export const storeOtp = internalMutation({
  args: {
    email: v.string(),
    codeHash: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Clean up any old OTPs for this email to prevent accumulation
    const existing = await ctx.db
      .query("otps")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .collect();

    for (const record of existing) {
      await ctx.db.delete(record._id);
    }

    // Store the new hashed OTP and expiration time
    await ctx.db.insert("otps", {
      email: args.email,
      codeHash: args.codeHash,
      expiresAt: args.expiresAt,
    });
  },
});

export const storeResetToken = internalMutation({
  args: {
    email: v.string(),
    token: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Clean up any old reset tokens for this email
    const existing = await ctx.db
      .query("resetTokens")
      .filter((q) => q.eq(q.field("email"), args.email))
      .collect();

    for (const record of existing) {
      await ctx.db.delete(record._id);
    }

    await ctx.db.insert("resetTokens", {
      email: args.email,
      token: args.token,
      expiresAt: args.expiresAt,
    });
  },
});

export const verifyAndConsumeResetToken = mutation({
  args: {
    email: v.string(),
    token: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("resetTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!record) {
      throw new ConvexError("Invalid reset token.");
    }

    if (record.email.toLowerCase() !== args.email.toLowerCase()) {
      throw new ConvexError("Reset token does not match this email address.");
    }

    if (Date.now() > record.expiresAt) {
      await ctx.db.delete(record._id);
      throw new ConvexError(
        "Reset link has expired. Please request a new one.",
      );
    }

    // Delete token so it can't be reused
    await ctx.db.delete(record._id);

    // Verify user profile exists
    const derivedUserId = `user_${btoa(args.email.toLowerCase()).replace(/=/g, "")}`;
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", derivedUserId))
      .unique();

    if (!profile) {
      throw new ConvexError("No profile found associated with this email.");
    }

    return { success: true };
  },
});
