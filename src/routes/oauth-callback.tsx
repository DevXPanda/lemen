import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { CheckCircle2, AlertCircle } from "lucide-react";

export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const exchangeCode = useAction(api.socialAction.exchangeOAuthCodeAction);
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [errorMsg, setErrorMsg] = useState("");
  const executionStarted = useRef(false);

  useEffect(() => {
    document.title = "Verifying social account — Pravixo";

    const processOAuth = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state"); // Format: platform:profileId:ownerType

      if (!code || !state) {
        setStatus("error");
        setErrorMsg("Missing OAuth authorization code or state parameters.");
        return;
      }

      const parts = state.split(":");
      if (parts.length !== 3) {
        setStatus("error");
        setErrorMsg("Invalid OAuth state validation string format.");
        return;
      }

      const [platform, profileId, ownerType] = parts;

      try {
        const redirectUri = `${window.location.origin}/oauth/callback`;
        const codeVerifier = sessionStorage.getItem("twitter_code_verifier") || undefined;

        await exchangeCode({
          code,
          platform,
          profileId: profileId as any,
          ownerType: ownerType as "creator" | "brand",
          redirectUri,
          codeVerifier,
        });

        setStatus("success");
        sessionStorage.removeItem("twitter_code_verifier");
        toast.success(`${platform.toUpperCase()} account successfully linked and verified!`);
        
        setTimeout(() => {
          navigate(ownerType === "creator" ? "/dashboard/influencer" : "/dashboard/customer");
        }, 1500);
      } catch (err) {
        const e = err as Error;
        setStatus("error");
        setErrorMsg(e.message || "OAuth credentials exchange failed.");
        toast.error(e.message || "Authorization failed.");
      }
    };

    if (!executionStarted.current) {
      executionStarted.current = true;
      processOAuth();
    }
  }, [searchParams, exchangeCode, navigate]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center p-8 rounded-3xl border border-border bg-card shadow-elevated">
        {status === "processing" && (
          <div className="space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary relative overflow-hidden">
              <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin m-2" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Verifying Account
              </h1>
              <p className="text-sm text-muted-foreground">
                Please wait while we exchange secure keys with the official platform API...
              </p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 animate-bounce">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Connection Verified!
              </h1>
              <p className="text-sm text-muted-foreground">
                Successfully authorized. Redirecting you back to your workspace...
              </p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Verification Failed
              </h1>
              <p className="text-sm text-destructive font-mono text-xs text-left bg-secondary p-3.5 rounded-xl overflow-x-auto mt-2">
                {errorMsg}
              </p>
            </div>
            <button
              onClick={() => navigate("/dashboard/influencer")}
              className="w-full inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/95 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
