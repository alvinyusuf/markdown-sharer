import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { documentCacheTag } from "@/lib/documents/cache";
import { getPublishedDocumentTree } from "@/lib/documents/public-queries";
import { splitIntoSections, type DocumentSection } from "@/lib/markdown/sections";

/**
 * The presentation sections of a published document.
 *
 * The sections are cut from the same sanitized tree the normal view renders,
 * so the content is identical. The cache tag is the one used by the document
 * itself, which means publishing, unpublishing, or deleting a document
 * invalidates the sections as well.
 */
export async function getPublishedSections(
  slug: string,
): Promise<DocumentSection[] | null> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 300, expire: 3600 });
  cacheTag(documentCacheTag(slug));

  const tree = await getPublishedDocumentTree(slug);

  if (!tree) {
    return null;
  }

  return splitIntoSections(tree);
}
