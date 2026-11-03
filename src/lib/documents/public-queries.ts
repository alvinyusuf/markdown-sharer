import "server-only";
import { decryptDocumentContent } from "@/lib/crypto/document-content";

import { cacheLife, cacheTag } from "next/cache";
import type { Root } from "hast";

import { documentCacheTag } from "@/lib/documents/cache";
import { processMarkdown } from "@/lib/markdown/processor";
import { createPublicClient } from "@/lib/supabase/public";
import type { PublicDocument } from "@/types/database";

const PUBLIC_COLUMNS =
  "id, title, slug, description, owner_id, content_encrypted, content_size_bytes, is_demo, expires_at, created_at, updated_at, published_at";

/**
 * Reads a published document by slug.
 *
 * The cookieless client is used on purpose. A visitor who happens to be signed
 * in while opening a public link must not be able to read a draft through
 * this route, and the anon key is the only credential that can do that.
 *
 * Authorization and decryption run on every read; only derived rendering is cached.
 */
async function readPublishedDocument(slug: string): Promise<PublicDocument | null> {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("documents")
    .select(PUBLIC_COLUMNS)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    throw new Error("Could not load this document.");
  }
  if (!data || (data.expires_at && Date.parse(data.expires_at) <= Date.now()))
    return null;
  const { owner_id, content_encrypted, content_size_bytes, ...document } = data;
  return {
    ...document,
    content: decryptDocumentContent(content_encrypted, {
      id: data.id,
      owner_id,
      is_demo: data.is_demo,
      content_size_bytes,
    }),
  };
}

// Never cache the access decision or owner plaintext.
export async function getPublishedDocument(slug: string): Promise<PublicDocument | null> {
  const document = await readPublishedDocument(slug);
  return document &&
    (!document.expires_at || Date.parse(document.expires_at) > Date.now())
    ? document
    : null;
}

/**
 * Renders the sanitized Markdown tree for a published document.
 *
 * The tree is cached separately from the row so that reading a large document
 * does not re-run the Markdown pipeline on every request. It is plain JSON,
 * which is what the cache requires.
 */
async function getCachedPublishedDocumentTree(slug: string): Promise<Root | null> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 300, expire: 3600 });
  cacheTag(documentCacheTag(slug));

  const document = await getPublishedDocument(slug);

  if (!document) {
    return null;
  }

  try {
    return await processMarkdown(document.content);
  } catch {
    // A document that is too large to render should not take the whole page
    // down. The page shows a friendly message instead.
    return null;
  }
}

export async function getPublishedDocumentTree(slug: string): Promise<Root | null> {
  if (!(await getPublishedDocument(slug))) return null;
  return getCachedPublishedDocumentTree(slug);
}
