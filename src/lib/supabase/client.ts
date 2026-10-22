"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabasePublicConfig } from "@/config/env";
import type { Database } from "@/types/database";

let browserClient: SupabaseClient<Database> | undefined;

export function createClient(): SupabaseClient<Database> {
  if (browserClient) {
    return browserClient;
  }

  const config = getSupabasePublicConfig();
  if (!config) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
    );
  }

  browserClient = createBrowserClient<Database>(config.url, config.anonKey);
  return browserClient;
}

export function isSupabaseConfigured(): boolean {
  return getSupabasePublicConfig() !== null;
}
