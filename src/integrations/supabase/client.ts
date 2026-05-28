// Supabase is deprecated in this project in favor of Convex.
// This file is kept to prevent build errors until manual deletion.
export const supabase = {
  auth: {
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    getSession: async () => ({ data: { session: null } }),
    signInWithPassword: async () => ({ data: { user: null }, error: null }),
    signOut: async () => {},
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        maybeSingle: async () => ({ data: null }),
        single: async () => ({ data: null }),
        order: () => ({ data: [] }),
      }),
    }),
  }),
  storage: {
    from: () => ({
      getPublicUrl: () => ({ data: { publicUrl: "" } }),
    }),
  },
} as any;
