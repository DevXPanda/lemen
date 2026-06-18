"use node";

import { v, ConvexError } from "convex/values";
import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import crypto from "crypto";
import nodemailer from "nodemailer";

export const sendOtp = action({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const { email } = args;

    // Check if the user is already registered (profile already exists)
    // The user ID format in the mock auth is user_ + base64(email)
    const derivedUserId = `user_${Buffer.from(email.toLowerCase()).toString("base64").replace(/=/g, "")}`;
    const existingProfile = await ctx.runQuery(api.profiles.getByUserId, {
      userId: derivedUserId,
    });

    if (existingProfile) {
      throw new ConvexError(
        "This email is already registered. Please sign in instead.",
      );
    }

    // Generate a secure 6-digit OTP
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const codeHash = crypto.createHash("sha256").update(otpCode).digest("hex");
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiration

    // Store OTP in V8 runtime database
    await ctx.runMutation(internal.otp.storeOtp, {
      email,
      codeHash,
      expiresAt,
    });

    // CRITICAL: Always print OTP to the Convex console log for local development
    console.log("=========================================");
    console.log(`[DEV] OTP Code for ${email}: ${otpCode}`);
    console.log("=========================================");

    let sent = false;

    // Attempt to send via configured SMTP env vars
    if (
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    ) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || "587"),
          secure: process.env.SMTP_PORT === "465",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: process.env.SMTP_FROM || `"Pravixo" <no-reply@pravixo.com>`,
          to: email,
          subject: "Verify your email - Pravixo",
          text: `Your verification code is ${otpCode}. This code will expire in 5 minutes.`,
          html: `<p>Your verification code is <strong>${otpCode}</strong>. This code will expire in 5 minutes.</p>`,
        });

        sent = true;
        console.log(`Email successfully sent to ${email} via SMTP.`);
      } catch (err) {
        console.error("Failed to send email via SMTP:", err);
      }
    }

    // Fallback to Ethereal Email test account if SMTP is not configured
    if (!sent) {
      try {
        console.log(
          "SMTP not configured. Attempting Ethereal Email fallback...",
        );
        const testAccount = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });

        const info = await transporter.sendMail({
          from: `"Pravixo" <no-reply@pravixo.com>`,
          to: email,
          subject: "Verify your email - Pravixo",
          text: `Your verification code is ${otpCode}. This code will expire in 5 minutes.`,
          html: `<p>Your verification code is <strong>${otpCode}</strong>. This code will expire in 5 minutes.</p>`,
        });

        console.log("Ethereal Email sent successfully!");
        console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
      } catch (err) {
        console.error("Ethereal Email fallback failed:", err);
      }
    }

    return { success: true };
  },
});

export const sendResetLink = action({
  args: {
    email: v.string(),
    origin: v.string(),
  },
  handler: async (ctx, args) => {
    const { email, origin } = args;

    // Verify if profile exists
    const derivedUserId = `user_${Buffer.from(email.toLowerCase()).toString("base64").replace(/=/g, "")}`;
    const existingProfile = await ctx.runQuery(api.profiles.getByUserId, {
      userId: derivedUserId,
    });

    if (!existingProfile) {
      throw new ConvexError("No account found with this email address.");
    }

    // Generate a secure 32-character hex reset token
    const token = crypto.randomBytes(16).toString("hex");
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes expiration

    // Store reset token
    await ctx.runMutation(internal.otp.storeResetToken, {
      email,
      token,
      expiresAt,
    });

    const resetLink = `${origin}/reset-password?email=${encodeURIComponent(email)}&token=${token}`;

    console.log("=========================================");
    console.log(`[DEV] Password Reset Link for ${email}:`);
    console.log(resetLink);
    console.log("=========================================");

    let sent = false;

    // Send email using SMTP
    if (
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    ) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || "587"),
          secure: process.env.SMTP_PORT === "465",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: process.env.SMTP_FROM || `" Pravixo" <no-reply@ Pravixo.com>`,
          to: email,
          subject: "Reset your password -  Pravixo",
          text: `Please reset your password using the following link (valid for 15 minutes):\n\n${resetLink}`,
          html: `<p>Please reset your password by clicking the link below (valid for 15 minutes):</p><p><a href="${resetLink}">Reset Password</a></p>`,
        });

        sent = true;
        console.log(`Reset email successfully sent to ${email} via SMTP.`);
      } catch (err) {
        console.error("Failed to send reset email via SMTP:", err);
      }
    }

    // Fallback Ethereal
    if (!sent) {
      try {
        console.log(
          "SMTP not configured. Attempting Ethereal Email fallback...",
        );
        const testAccount = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });

        const info = await transporter.sendMail({
          from: `" Pravixo" <no-reply@ Pravixo.com>`,
          to: email,
          subject: "Reset your password -  Pravixo",
          text: `Please reset your password using the following link (valid for 15 minutes):\n\n${resetLink}`,
          html: `<p>Please reset your password by clicking the link below (valid for 15 minutes):</p><p><a href="${resetLink}">Reset Password</a></p>`,
        });

        console.log("Ethereal Reset Email sent successfully!");
        console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
      } catch (err) {
        console.error("Ethereal Reset Email fallback failed:", err);
      }
    }

    return { success: true };
  },
});
