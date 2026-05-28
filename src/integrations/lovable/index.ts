// Lovable integration is deprecated in favor of Convex.
export const lovable = {
  auth: {
    signInWithOAuth: async () => ({ error: new Error("OAuth is not configured for Convex yet") }),
  },
} as any;
