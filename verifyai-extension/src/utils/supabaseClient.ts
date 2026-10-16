import { createClient } from "@supabase/supabase-js";
import { env } from "@/utils/env";

// Used only to decode/validate sessions client-side (setSession, getUser).
// Sign-in itself goes through chrome.identity.launchWebAuthFlow — see
// src/hooks/useAuth.ts — since the extension has no cookie storage for
// Supabase's default browser redirect flow.
export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
