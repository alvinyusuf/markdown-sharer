import "server-only";

import { cacheLife } from "next/cache";

import { hasSupabaseEnv } from "@/config/env";
import { createClient } from "@/lib/supabase/server";

/**
 * Reads the signed-in user from the session cookie.
 *
 * `'use cache: private'` is required here, not an optimisation:
 *
 * - Reading a session compares the token expiry against the current time.
 *   `Date.now()` is an unstable value, and Next.js refuses to see it while a
 *   static shell is prerendered ("Blocking Route" / `unstable value`).
 * - A private cache scope runs at request time, is excluded from the static
 *   shell, may read `cookies()`, and may read the current time.
 *
 * The result is never shared between visitors: it is keyed by the request's
 * cookies and never stored in the shared server cache.
 */
async function readSessionUser() {
  "use cache: private";
  cacheLife({ stale: 30 });

  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return data.user;
}

/**
 * Request-scoped authenticated user lookup. Never trust the proxy alone:
 * pages and server actions call this before reading or mutating data.
 */
export async function getCurrentUser() {
  return readSessionUser();
}
