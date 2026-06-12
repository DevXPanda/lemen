import { useEffect } from "react";
import {
  Moon,
  Sun,
  Monitor,
  Database,
  Shield,
  Info,
  Sparkles,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function SettingsPage() {
  useEffect(() => {
    document.title = "Settings — Lumen Admin";
  }, []);

  const { theme, toggle, setTheme } = useTheme();

  const convexUrl = import.meta.env.VITE_CONVEX_URL || "Not configured";

  return (
    <div className="p-6 lg:p-8">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Admin panel configuration and preferences
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Theme Card */}
        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-sunset shadow-glow">
              <Monitor className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold">Appearance</h2>
              <p className="text-xs text-muted-foreground">
                Choose your preferred theme
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => setTheme("light")}
              className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-5 transition-all ${
                theme === "light"
                  ? "border-primary shadow-glow"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                  theme === "light"
                    ? "gradient-warm text-white"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                <Sun className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium">Light</span>
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-5 transition-all ${
                theme === "dark"
                  ? "border-primary shadow-glow"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                  theme === "dark"
                    ? "gradient-pink text-white"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                <Moon className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium">Dark</span>
            </button>
          </div>
        </div>

        {/* Session Info Card */}
        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-pink shadow-pink">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold">Session</h2>
              <p className="text-xs text-muted-foreground">
                Current admin session details
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-border p-4">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Auth status</span>
              </div>
              <Badge className="rounded-full gradient-sunset border-0 text-white text-[10px]">
                Authenticated
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border p-4">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Storage</span>
              </div>
              <span className="text-xs text-muted-foreground">
                Local storage (persistent)
              </span>
            </div>
          </div>
        </div>

        {/* Convex Connection Card */}
        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 shadow-lg shadow-emerald-500/30">
              <Database className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold">Backend</h2>
              <p className="text-xs text-muted-foreground">
                Convex database connection
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-border p-4">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Convex URL
              </div>
              <div className="mt-1 font-mono text-sm break-all">
                {convexUrl}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border p-4">
              <span className="text-sm">Connection</span>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
                <span className="text-xs font-medium text-emerald-600">
                  Connected
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* About Card */}
        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-sunset shadow-glow">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold">About</h2>
              <p className="text-xs text-muted-foreground">
                Platform information
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-border p-4">
              <span className="text-sm">Platform</span>
              <span className="font-display text-sm font-semibold">Lumen</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border p-4">
              <span className="text-sm">Admin version</span>
              <Badge variant="secondary" className="rounded-full text-[10px]">
                1.0.0
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border p-4">
              <span className="text-sm">Framework</span>
              <span className="text-xs text-muted-foreground">
                React + Vite + Convex
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
