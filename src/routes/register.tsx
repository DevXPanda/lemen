import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Sparkles,
  Mail,
  Lock,
  User,
  Briefcase,
  Camera,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

type Role = "creator" | "brand";

export function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signUpMock } = useAuth();
  const [role, setRole] = useState<Role>("creator");

  useEffect(() => {
    document.title = "Create account — Pravixo";
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const selectedRole = params.get("role");

    if (selectedRole === "brand" || selectedRole === "creator") {
      setRole(selectedRole);
    }
  }, [location.search]);

  // If already signed in, redirect
  useEffect(() => {
    if (user && profile) {
      navigate(
        profile.role === "creator"
          ? "/dashboard/influencer"
          : "/dashboard/customer",
      );
    }
  }, [user, profile, navigate]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // OTP flow state
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verifying, setVerifying] = useState(false);

  const sendOtpAction = useAction(api.otpAction.sendOtp);

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const valid =
    name.length > 1 &&
    /^\S+@\S+\.\S+$/.test(email) &&
    password.length >= 6 &&
    password === confirmPassword;

  // Stage 1: Send OTP code to user's email
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    setSubmitting(true);

    try {
      await sendOtpAction({ email });
      toast.success(`Verification code sent to ${email}`);
      setShowOtp(true);
      setResendCooldown(30);
    } catch (err) {
      const error = err as { data?: string; message?: string };
      toast.error(
        error.data || error.message || "Failed to send verification code.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setSubmitting(true);
    try {
      await sendOtpAction({ email });
      toast.success(`A new verification code has been sent to ${email}`);
      setResendCooldown(30);
    } catch (err) {
      const error = err as { data?: string; message?: string };
      toast.error(
        error.data || error.message || "Failed to resend verification code.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Verify and register helper (shared between auto-submit and button-submit)
  const verifyAndRegister = async (code: string) => {
    setVerifying(true);
    try {
      await signUpMock(role, email, name, code);
      toast.success("Account created — welcome to Pravixo");
      navigate(
        role === "creator" ? "/dashboard/influencer" : "/dashboard/customer",
      );
    } catch (err) {
      const error = err as { data?: string; message?: string };
      toast.error(
        error.data ||
          error.message ||
          "Verification failed. Please check the code and try again.",
      );
    } finally {
      setVerifying(false);
    }
  };

  // Stage 2: Verify OTP and create profile (button fallback)
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit verification code.");
      return;
    }
    await verifyAndRegister(otp);
  };

  // Auto-submit when the user enters the 6th digit
  const handleOtpChange = async (val: string) => {
    setOtp(val);
    if (val.length === 6) {
      await verifyAndRegister(val);
    }
  };

  return (
    <div className="relative grid min-h-[calc(100vh-64px)] place-items-center px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-20 right-1/4 h-80 w-80 rounded-full gradient-warm opacity-20 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full gradient-pink opacity-20 blur-3xl" />
      </div>

      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-elevated">
        {!showOtp ? (
          <>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl gradient-sunset shadow-glow">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h1 className="font-display text-2xl font-bold">
                Create your account
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick your path — you can always switch later.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {(
                [
                  {
                    id: "creator",
                    label: "I'm a creator",
                    icon: Camera,
                    desc: "Build profile, get hired",
                  },
                  {
                    id: "brand",
                    label: "I'm a brand",
                    icon: Briefcase,
                    desc: "Discover & hire creators",
                  },
                ] as const
              ).map((r) => {
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
                    <r.icon
                      className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`}
                    />
                    <div className="mt-2 text-sm font-semibold">{r.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.desc}
                    </div>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleRequestOtp} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="name">
                  {role === "brand" ? "Brand name" : "Full name"}
                </Label>
                <div className="relative mt-1.5">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Adidas"
                    className="pl-10"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative mt-1.5">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@email.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="pwd">Password</Label>
                <div className="relative mt-1.5">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="pwd"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="confirmPwd">Confirm Password</Label>
                <div className="relative mt-1.5">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPwd"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repeat your password"
                    className="pl-10 pr-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              {touched && !valid && (
                <p className="text-xs text-destructive">
                  {name.length <= 1
                    ? "Name must be at least 2 characters."
                    : !/^\S+@\S+\.\S+$/.test(email)
                      ? "Please enter a valid email address."
                      : password.length < 6
                        ? "Password must be at least 6 characters."
                        : password !== confirmPassword
                          ? "Passwords do not match."
                          : "Please fill all fields correctly."}
                </p>
              )}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full gradient-sunset border-0 text-white shadow-glow"
              >
                {submitting ? "Sending code…" : "Create account"}
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
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
                />
              </svg>
              Continue with Google
            </Button>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have one?{" "}
              <Link
                to="/login"
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </>
        ) : (
          <>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl gradient-sunset shadow-glow">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <h1 className="font-display text-2xl font-bold">
                Verify your email
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                We sent a 6-digit verification code to{" "}
                <span className="font-semibold text-foreground">{email}</span>.
              </p>
            </div>

            <form onSubmit={handleVerifyAndRegister} className="mt-8 space-y-6">
              <div className="flex flex-col items-center justify-center">
                <Label htmlFor="otp" className="sr-only">
                  Verification Code
                </Label>
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={handleOtpChange}
                  disabled={verifying}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={verifying || otp.length !== 6}
                  className="w-full rounded-full gradient-sunset border-0 text-white shadow-glow"
                >
                  {verifying ? "Verifying..." : "Verify & Register"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full rounded-full text-muted-foreground hover:text-foreground animate-none hover:bg-accent/40"
                  onClick={() => {
                    setShowOtp(false);
                    setOtp("");
                  }}
                  disabled={verifying}
                >
                  Back to registration
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Didn't receive the code?{" "}
              {resendCooldown > 0 ? (
                <span className="font-medium text-muted-foreground">
                  Resend in {resendCooldown}s
                </span>
              ) : (
                <button
                  type="button"
                  className="font-medium text-primary hover:underline bg-transparent border-0 cursor-pointer p-0"
                  onClick={handleResendOtp}
                  disabled={submitting}
                >
                  Resend Code
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
