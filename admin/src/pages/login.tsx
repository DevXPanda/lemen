import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Shield, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Admin Login —  Pravixo";
    // If already authed, redirect
    if (
      localStorage.getItem("admin_authed") === "true" ||
      sessionStorage.getItem("admin_authed") === "true"
    ) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Simulate a small delay for UX
    setTimeout(() => {
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || "nktech@gmail.com";
      const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || "123456";

      if (email === adminEmail && password === adminPassword) {
        localStorage.setItem("admin_authed", "true");
        sessionStorage.setItem("admin_authed", "true");
        navigate("/dashboard", { replace: true });
      } else {
        setError("Invalid email or password. Access denied.");
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 overflow-hidden">
      {/* Background blobs */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl animate-blob" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-violet/10 blur-3xl animate-blob [animation-delay:4s]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-magenta/10 blur-3xl animate-blob [animation-delay:8s]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-sunset shadow-glow">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">
            Pravixo Admin
          </h1>
          <div className="mt-1 flex items-center gap-1.5 text-muted-foreground">
            <Shield className="h-3.5 w-3.5" />
            <span className="text-xs">Protected access</span>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-border bg-card p-8 shadow-elevated">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="admin-email" className="text-sm font-medium">
                Email address
              </Label>
              <div className="mt-1.5">
                <Input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nktech@gmail.com"
                  autoFocus
                  className="w-full"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="admin-password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative mt-1.5">
                <Input
                  id="admin-password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="pr-10"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full rounded-full gradient-sunset border-0 text-white shadow-glow hover:opacity-95 transition-opacity"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Verifying…
                </span>
              ) : (
                "Access dashboard"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Contact your system administrator if you don't have access
            credentials.
          </p>
        </div>
      </div>
    </div>
  );
}
