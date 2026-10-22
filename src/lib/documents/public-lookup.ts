import "server-only";

import { createPublicClient } from "@/lib/supabase/public";

/**
 * A cheap existence check for the proxy.
 *
 * The proxy runtime cannot use the `"use cache"` scope from
 * `public-queries.ts`, so it runs its own small query. It only reads the id of
 * a published document and never touches the content.
 */
export async function isPublishedDocument(slug: string): Promise<boolean> {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("documents")
    .select("id")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    // Fail open. A temporary database problem should not turn a public link
    // into a hard 404; the page renders its own message instead.
    console.error("[public-document] proxy lookup failed:", error.message);
    return true;
  }

  return Boolean(data);
}
