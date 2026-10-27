import type { Metadata } from "next";

import { getSiteUrl } from "@/config/env";
import type { PublicDocument } from "@/types/database";

const META_DESCRIPTION_MAX_LENGTH = 180;
const EXCERPT_MAX_LENGTH = 160;

/**
 * Turns Markdown into a short plain-text excerpt.
 *
 * Used as the fallback meta description when the author did not write one.
 * The result is only used for link previews, never rendered as HTML.
 */
export function excerptFromMarkdown(
  markdown: string,
  maxLength = EXCERPT_MAX_LENGTH,
): string {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`\n]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}>\s?/gm, "")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s{0,3}(?:[-*+]|\d+\.)\s+/gm, "")
    .replace(/^\s{0,3}(?:[-*_]\s*){3,}$/gm, " ")
    .replace(/[*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (plain.length <= maxLength) {
    return plain;
  }

  return `${plain.slice(0, maxLength - 1).trimEnd()}…`;
}

export function publicDocumentUrl(slug: string, siteUrl = getSiteUrl()): string {
  return `${siteUrl.replace(/\/+$/, "")}/p/${slug}`;
}

export function documentDescription(
  document: Pick<PublicDocument, "title" | "description" | "content">,
): string {
  const authored = document.description?.trim();

  if (authored) {
    return authored.length > META_DESCRIPTION_MAX_LENGTH
      ? `${authored.slice(0, META_DESCRIPTION_MAX_LENGTH - 1).trimEnd()}…`
      : authored;
  }

  const excerpt = excerptFromMarkdown(document.content);

  if (excerpt) {
    return excerpt;
  }

  return `${document.title} — shared with Readmeo.`;
}

/**
 * Builds the metadata for a public document: canonical URL, page title,
 * description, and Open Graph / Twitter card tags.
 */
export function buildDocumentMetadata(
  document: Pick<
    PublicDocument,
    "title" | "slug" | "description" | "content" | "published_at"
  >,
  options: { siteUrl?: string } = {},
): Metadata {
  const siteUrl = options.siteUrl ?? getSiteUrl();
  const canonical = publicDocumentUrl(document.slug, siteUrl);
  const description = documentDescription(document);

  return {
    title: document.title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "article",
      url: canonical,
      siteName: "Readmeo",
      title: document.title,
      description,
      publishedTime: document.published_at ?? undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: document.title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
