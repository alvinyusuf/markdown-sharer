import { describe, expect, it } from "vitest";

import { documentCacheTag } from "@/lib/documents/cache";
import {
  buildDocumentMetadata,
  documentDescription,
  excerptFromMarkdown,
  publicDocumentUrl,
} from "@/lib/documents/metadata";
import { documentSlugSchema } from "@/lib/validation/schemas";

const SITE_URL = "https://markdownshare.app";

const document = {
  title: "Product launch notes",
  slug: "product-launch-notes-1a2b3c4d",
  description: "A short brief for the Atlas release.",
  content: "# Product launch notes\n\nEverything below is plain **Markdown**.\n",
  published_at: "2026-10-22T09:00:00.000Z",
};

describe("public document urls", () => {
  it("builds an absolute url from the site origin", () => {
    expect(publicDocumentUrl(document.slug, SITE_URL)).toBe(
      `${SITE_URL}/p/${document.slug}`,
    );
  });

  it("never leaves a double slash behind", () => {
    expect(publicDocumentUrl(document.slug, `${SITE_URL}/`)).toBe(
      `${SITE_URL}/p/${document.slug}`,
    );
  });
});

describe("cache tags", () => {
  it("derives a stable tag from the slug", () => {
    expect(documentCacheTag("abc-123")).toBe("document:abc-123");
    expect(documentCacheTag("abc-123")).toBe(documentCacheTag("abc-123"));
  });
});

describe("excerpts", () => {
  it("strips markdown syntax", () => {
    const excerpt = excerptFromMarkdown(
      "# Title\n\nSome **bold** and [a link](https://example.com) and `code`.\n",
    );

    expect(excerpt).toBe("Title Some bold and a link and .");
  });

  it("drops code blocks and images", () => {
    const excerpt = excerptFromMarkdown(
      "Intro text.\n\n```ts\nconst secret = 1;\n```\n\n![diagram](https://example.com/a.png)\n",
    );

    expect(excerpt).toBe("Intro text.");
  });

  it("truncates long content", () => {
    const excerpt = excerptFromMarkdown("word ".repeat(100), 20);

    expect(excerpt.length).toBeLessThanOrEqual(20);
    expect(excerpt.endsWith("…")).toBe(true);
  });
});

describe("document descriptions", () => {
  it("prefers the description written by the author", () => {
    expect(
      documentDescription({
        title: document.title,
        description: document.description,
        content: document.content,
      }),
    ).toBe(document.description);
  });

  it("falls back to an excerpt of the content", () => {
    expect(
      documentDescription({
        title: document.title,
        description: null,
        content: document.content,
      }),
    ).toBe("Product launch notes Everything below is plain Markdown.");
  });

  it("falls back to the title when there is nothing else", () => {
    expect(
      documentDescription({
        title: document.title,
        description: null,
        content: "",
      }),
    ).toBe(`${document.title} — shared with MarkdownShare.`);
  });
});

describe("public document metadata", () => {
  const metadata = buildDocumentMetadata(document, { siteUrl: SITE_URL });

  it("uses the document title as the page title", () => {
    expect(metadata.title).toBe(document.title);
  });

  it("sets an absolute canonical url", () => {
    expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/p/${document.slug}`);
  });

  it("mirrors the title and description into open graph and twitter cards", () => {
    expect(metadata.openGraph).toMatchObject({
      type: "article",
      title: document.title,
      description: document.description,
      url: `${SITE_URL}/p/${document.slug}`,
    });

    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      title: document.title,
      description: document.description,
    });
  });

  it("lets search engines index published documents", () => {
    expect(metadata.robots).toEqual({ index: true, follow: true });
  });
});

describe("public slugs", () => {
  it("rejects slugs that are not url safe", () => {
    expect(documentSlugSchema.safeParse("Product-Launch").success).toBe(false);
    expect(documentSlugSchema.safeParse("product-launch").success).toBe(true);
  });
});
