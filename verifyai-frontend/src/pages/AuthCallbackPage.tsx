import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { ErrorState } from "@/components/StateViews";
import { supabase } from "@/lib/supabaseClient";
import { ROUTES } from "@/lib/routes";

export function AuthCallbackPage() {
  const [status, setStatus] = useState<"pending" | "done" | "error">("pending");

  useEffect(() => {
    // supabase-js with detectSessionInUrl reads the OAuth redirect automatically;
    // we just wait for it to finish before routing into the app.
    supabase.auth.getSession().then(({ data, error }) => {
      setStatus(error || !data.session ? "error" : "done");
    });
  }, []);

  if (status === "done") return <Navigate to={ROUTES.verify} replace />;

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <ErrorState message="Sign-in failed or was cancelled." onRetry={() => (window.location.href = ROUTES.login)} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 p-4">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">Signing you in…</p>
    </div>
  );
}
