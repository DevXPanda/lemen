import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Mail, Lock, Camera, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth, UserRole } from "@/components/auth-provider";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Lumen" }] }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const { user, profile, signInMock } = useAuth();
  const [role, setRole] = useState<UserRole>("creator");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // If already signed in, redirect
  useEffect(() => {
    if (user && profile) {
      navigate({ to: profile.role === "creator" ? "/dashboard/influencer" : "/dashboard/customer" });
    }
  }, [user, profile, navigate]);

  const emailValid = /^\S+@\S+\.\S+$/.test(email);
  const passValid = password.length >= 6;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!emailValid || !passValid) return;
    setSubmitting(true);
    
    // Using mock sign in for Convex migration
    try {
      await signInMock(role, email);
      toast.success("Welcome back!");
      navigate({ to: role === "creator" ? "/dashboard/influencer" : "/dashboard/customer" });
    } catch (error: any) {
      // Use error.data for ConvexError message if available
      toast.error(error.data || error.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative grid min-h-[calc(100vh-64px)] place-items-center px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-20 left-1/4 h-80 w-80 rounded-full gradient-warm opacity-20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full gradient-pink opacity-20 blur-3xl" />
      </div>

      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-elevated">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl gradient-sunset shadow-glow">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to continue to Lumen</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {([
            { id: "creator", label: "Creator", icon: Camera },
            { id: "brand", label: "Brand", icon: Briefcase },
          ] as const).map((r) => {
            const active = role === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  active
                    ? "border-primary bg-accent/40 shadow-soft"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <r.icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                <div className="mt-2 text-sm font-semibold">{r.label}</div>
              </button>
            );
          })}
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="relative mt-1.5">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" type="email" placeholder="you@brand.in" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            {touched && !emailValid && <p className="mt-1 text-xs text-destructive">Enter a valid email.</p>}
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a href="#" className="text-xs text-primary hover:underline">Forgot?</a>
            </div>
            <div className="relative mt-1.5">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="password" type="password" placeholder="••••••••" className="pl-10" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {touched && !passValid && <p className="mt-1 text-xs text-destructive">At least 6 characters.</p>}
          </div>
          <Button type="submit" disabled={submitting} className="w-full rounded-full gradient-sunset border-0 text-white shadow-glow">
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <div className="mt-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">OR</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="mt-4 w-full rounded-full"
          onClick={() => toast.info("OAuth is coming soon for Convex!")}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
          Continue with Google
        </Button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">Create account</Link>
        </p>
      </div>
    </div>
  );
}
