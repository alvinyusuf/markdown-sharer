import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { getSupabasePublicConfig } from "@/config/env";
import type { Database } from "@/types/database";

/**
 * Cookieless client for reading published documents. It can never see a
 * signed-in user's session, so a public route cannot accidentally expose a
 * draft owned by the current visitor.
 */
export function createPublicClient() {
  const config = getSupabasePublicConfig();
  if (!config) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
    );
  }

  return createSupabaseClient<Database>(config.url, config.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
