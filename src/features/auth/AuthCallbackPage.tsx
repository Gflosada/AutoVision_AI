import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { getSupabaseClient } from "../../lib/supabase/client";
import { useAuthStore } from "./auth.store";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const initialize = useAuthStore((state) => state.initialize);
  const [message, setMessage] = useState("Confirming your account...");

  useEffect(() => {
    const confirm = async () => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        navigate("/login", { replace: true });
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else if (window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.slice(1));
          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");
          if (accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (error) throw error;
          }
        }

        setMessage("Account confirmed. Opening your dashboard...");
        await initialize();
        toast.success("Email confirmed.");
        navigate("/dashboard", { replace: true });
      } catch (error) {
        const description = error instanceof Error ? error.message : "Unable to confirm your email.";
        setMessage(description);
        toast.error(description);
        navigate("/login", { replace: true });
      }
    };

    void confirm();
  }, [initialize, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="glass-panel rounded-2xl p-8 max-w-md text-center">
        <h1 className="text-2xl mb-3">AutoVision AI</h1>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
