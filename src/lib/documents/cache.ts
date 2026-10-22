/**
 * Cache tags for the public document route.
 *
 * The tag is derived from the slug, which never changes after a document is
 * created. Publishing, unpublishing, or editing a document therefore only has
 * to expire one tag to make the public URL correct again.
 */
export const DOCUMENT_CACHE_TAG_PREFIX = "document:";

export function documentCacheTag(slug: string): string {
  return `${DOCUMENT_CACHE_TAG_PREFIX}${slug}`;
}
