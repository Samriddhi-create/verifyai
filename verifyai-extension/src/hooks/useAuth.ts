import { useCallback, useEffect, useState } from "react";
import type { AuthenticatedUser, Session } from "@/types";
import { env } from "@/utils/env";
import { clearStoredSession, getStoredSession, setStoredSession } from "@/utils/storage";

export type OAuthProvider = "google" | "github";

interface UseAuthResult {
  user: AuthenticatedUser | null;
  isLoading: boolean;
  error: string | null;
  signIn: (provider: OAuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getStoredSession()
      .then((session) => setUser(session?.user ?? null))
      .finally(() => setIsLoading(false));
  }, []);

  const signIn = useCallback(async (provider: OAuthProvider) => {
    setIsLoading(true);
    setError(null);
    try {
      const redirectUrl = chrome.identity.getRedirectURL();
      const authorizeUrl = new URL(`${env.supabaseUrl}/auth/v1/authorize`);
      authorizeUrl.searchParams.set("provider", provider);
      authorizeUrl.searchParams.set("redirect_to", redirectUrl);

      const responseUrl = await chrome.identity.launchWebAuthFlow({
        url: authorizeUrl.toString(),
        interactive: true,
      });
      if (!responseUrl) {
        throw new Error("Sign-in was cancelled.");
      }

      const fragment = new URL(responseUrl).hash.replace(/^#/, "");
      const params = new URLSearchParams(fragment);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const expiresIn = Number(params.get("expires_in") ?? "3600");

      if (!accessToken || !refreshToken) {
        const errorDescription = params.get("error_description");
        throw new Error(errorDescription ?? "Sign-in did not return a valid session.");
      }

      // Loaded only now: the Supabase client is by far the heaviest dependency
      // and nothing else in the popup needs it.
      const { supabase } = await import("@/utils/supabaseClient");
      const { data, error: userError } = await supabase.auth.getUser(accessToken);
      if (userError || !data.user) {
        throw new Error("Could not verify the signed-in account.");
      }

      const session: Session = {
        accessToken,
        refreshToken,
        user: { id: data.user.id, email: data.user.email ?? null },
        expiresAt: Date.now() + expiresIn * 1000,
      };
      await setStoredSession(session);
      setUser(session.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    await clearStoredSession();
    setUser(null);
  }, []);

  return { user, isLoading, error, signIn, signOut };
}
