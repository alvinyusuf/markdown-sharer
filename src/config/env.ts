const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export type SupabasePublicConfig = {
  url: string;
  anonKey: string;
};

/**
 * Returns the public Supabase configuration when both values are present.
 * Client components call this lazily so that a missing `.env.local` renders a
 * helpful setup screen instead of crashing the whole bundle.
 */
export function getSupabasePublicConfig(): SupabasePublicConfig | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }

  return {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,
  };
}

export function hasSupabaseEnv(): boolean {
  return getSupabasePublicConfig() !== null;
}

/**
 * Absolute origin used for auth redirects and canonical URLs.
 */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return `https://${vercelUrl.replace(/\/+$/, "")}`;
  }

  return "http://localhost:3000";
}
