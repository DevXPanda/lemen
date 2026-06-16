import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export type UserRole = "creator" | "brand";

export type Profile = {
  _id: Id<"profiles">;
  fullName: string;
  role: UserRole;
  userId: string;
  handle?: string;
  category?: string;
  location?: string;
  bio?: string;
  startingPrice?: number;
  avatarUrl?: string;
  coverUrl?: string;
  // Stats
  profileViews?: number;
  clicks?: number;
  bookings?: number;
  // Socials
  instagramHandle?: string;
  instagramFollowers?: number;
  facebookHandle?: string;
  facebookFollowers?: number;
  linkedinHandle?: string;
  linkedinFollowers?: number;
  youtubeHandle?: string;
  youtubeFollowers?: number;
  quoraHandle?: string;
  quoraFollowers?: number;
  twitterHandle?: string;
  twitterFollowers?: number;
  // Brand preferences
  prefNiches?: string;
  prefBudget?: string;
  prefReach?: string;
  prefRegions?: string;
  website?: string;
  companySize?: string;
};

type AuthCtx = {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInMock: (role: UserRole, email?: string) => Promise<void>;
  signUpMock: (
    role: UserRole,
    email: string,
    name: string,
    otpCode: string,
  ) => Promise<void>;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // MOCK AUTH for now since Supabase is gone
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);

  const profile = useQuery(
    api.profiles.getByUserId,
    user ? { userId: user.id } : "skip",
  );
  const createProfile = useMutation(api.profiles.create);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(" Pravixo_user");
    if (saved) {
      setUser(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const signInMock = async (
    role: UserRole,
    email: string = "hello@example.com",
  ) => {
    // Generate a simple ID from email
    const id = `user_${btoa(email.toLowerCase()).replace(/=/g, "")}`;
    const mockUser = { id, email };

    // Check if profile exists (using a new mutation or logic)
    // For now, I'll update the Convex mutation to have a 'isLogin' flag
    await createProfile({
      userId: mockUser.id,
      fullName: email.split("@")[0],
      role: role,
      isLogin: true, // New flag to prevent creation on login
    });

    setUser(mockUser);
    localStorage.setItem(" Pravixo_user", JSON.stringify(mockUser));
  };

  const signUpMock = async (
    role: UserRole,
    email: string,
    name: string,
    otpCode: string,
  ) => {
    const id = `user_${btoa(email.toLowerCase()).replace(/=/g, "")}`;
    const mockUser = { id, email };

    await createProfile({
      userId: mockUser.id,
      fullName: name,
      role: role,
      isLogin: false, // Allow creation on signup
      email: email,
      otpCode: otpCode,
    });

    setUser(mockUser);
    localStorage.setItem(" Pravixo_user", JSON.stringify(mockUser));
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem(" Pravixo_user");
  };

  return (
    <Ctx.Provider
      value={{
        user,
        profile: profile ?? null,
        loading,
        signOut,
        signInMock,
        signUpMock,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
