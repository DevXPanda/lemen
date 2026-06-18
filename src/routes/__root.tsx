import { Outlet, Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { SiteNavbar } from "@/components/site-navbar";
import { SiteFooter } from "@/components/site-footer";
import { Toaster } from "@/components/ui/sonner";
import { ConvexProvider } from "convex/react";
import { convex } from "@/lib/convex";

export function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-gradient-sunset">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-medium gradient-sunset text-white shadow-glow"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function GoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    const gtag = (window as any).gtag;
    if (typeof gtag === "function") {
      gtag("config", "G-3M20Z6KMKR", {
        page_path: location.pathname + location.search,
        page_location: window.location.href,
      });
    }
  }, [location]);

  return null;
}

import { useAuth } from "@/components/auth-provider";
import { ShieldAlert, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

function SuspensionNotice({ profile, signOut }: { profile: any; signOut: () => void }) {
  const suspendedUntilDate = profile.suspendedUntil
    ? new Date(profile.suspendedUntil).toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "indefinitely";

  const daysLeft = profile.suspendedUntil
    ? Math.max(0, Math.ceil((profile.suspendedUntil - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="relative flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-destructive/10 opacity-30 blur-3xl" />
      </div>

      <div className="w-full max-w-md rounded-3xl border border-destructive/20 bg-card/60 p-8 shadow-elevated backdrop-blur-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive shadow-glow animate-pulse">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          Account Suspended
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account has been temporarily restricted by Pravixo administration for violating platform guidelines.
        </p>

        <div className="mt-6 rounded-2xl border border-border bg-muted/40 p-5 text-left space-y-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reason for Suspension</span>
            <p className="text-sm font-medium mt-1 text-foreground">
              {profile.suspensionReason || "No reason specified."}
            </p>
          </div>
          <div className="border-t border-border/60 pt-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Access Restored On</span>
            <p className="text-sm font-medium mt-1 text-foreground">
              {suspendedUntilDate}
            </p>
            {daysLeft > 0 ? (
              <span className="inline-block mt-1 text-[11px] font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                {daysLeft} day{daysLeft !== 1 && "s"} remaining
              </span>
            ) : (
              <span className="inline-block mt-1 text-[11px] font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                Less than a day remaining
              </span>
            )}
          </div>
        </div>

        <Button
          onClick={signOut}
          className="mt-8 w-full rounded-full bg-destructive text-white hover:bg-destructive/90 shadow-glow border-0 flex items-center justify-center gap-2"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </Button>
      </div>
    </div>
  );
}

function MainContent() {
  const { profile, loading, signOut } = useAuth();

  const isSuspended =
    profile?.isSuspended &&
    profile?.suspendedUntil &&
    profile.suspendedUntil > Date.now();

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-140px)] items-center justify-center">
        <p className="text-sm text-muted-foreground animate-pulse font-medium">Loading details...</p>
      </div>
    );
  }

  if (isSuspended) {
    return <SuspensionNotice profile={profile} signOut={signOut} />;
  }

  return <Outlet />;
}

export function RootLayout() {
  return (
    <ThemeProvider>
      <ConvexProvider client={convex}>
        <AuthProvider>
          <GoogleAnalytics />
          <div className="flex min-h-screen flex-col">
            <SiteNavbar />
            <main className="flex-1">
              <MainContent />
            </main>
            <SiteFooter />
          </div>
          <Toaster />
        </AuthProvider>
      </ConvexProvider>
    </ThemeProvider>
  );
}
