import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { CalendarDays } from "lucide-react";

import { CopyLinkButton } from "@/components/documents/copy-link-button";
import { ShareButton } from "@/components/documents/share-button";
import { PresentButton } from "@/components/presentation/present-button";
import { buildDocumentMetadata, publicDocumentUrl } from "@/lib/documents/metadata";
import {
  getPublishedDocument,
  getPublishedDocumentTree,
} from "@/lib/documents/public-queries";
import { renderTree } from "@/lib/markdown/render";
import { formatDate } from "@/lib/utils/date";
import { documentSlugSchema } from "@/lib/validation/schemas";

/**
 * The public route waits for the document before it answers.
 *
 * A Suspense boundary would flush the shell early, and a document that does
 * not exist has to answer with a real 404 status instead of a 200 that only
 * looks like an error page. The document data itself is still cached, so the
 * wait stays short.
 */
export const instant = false;

const NOT_FOUND_METADATA: Metadata = {
  title: "Document not found",
  robots: { index: false, follow: false },
};

export async function generateMetadata(props: PageProps<"/p/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const parsed = documentSlugSchema.safeParse(slug);

  if (!parsed.success) {
    return NOT_FOUND_METADATA;
  }

  const document = await getPublishedDocument(parsed.data);

  if (!document) {
    return NOT_FOUND_METADATA;
  }

  return buildDocumentMetadata(document);
}

export default async function PublicDocumentPage(props: PageProps<"/p/[slug]">) {
  // The route answers at request time so that a missing document can be
  // reported with a real 404 status instead of a streamed 200.
  await connection();

  const { slug } = await props.params;
  const parsed = documentSlugSchema.safeParse(slug);

  if (!parsed.success) {
    notFound();
  }

  const document = await getPublishedDocument(parsed.data);

  if (!document) {
    notFound();
  }

  const tree = await getPublishedDocumentTree(parsed.data);
  const canonical = publicDocumentUrl(document.slug);

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-10 border-b pb-8">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {document.published_at ? (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5" />
              Published {formatDate(document.published_at)}
            </span>
          ) : null}
          <span aria-hidden="true">·</span>
          <span className="font-mono">/p/{document.slug}</span>
        </div>

        <h1 className="mt-4 font-serif text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">
          {document.title}
        </h1>

        {document.description ? (
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {document.description}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <CopyLinkButton url={canonical} />
          <ShareButton url={canonical} title={document.title} />
          <PresentButton slug={document.slug} documentTitle={document.title} />
        </div>
      </header>

      {tree ? (
        <div className="prose-doc prose max-w-none">{renderTree(tree)}</div>
      ) : (
        <div className="rounded-2xl border border-dashed bg-card/60 px-6 py-12 text-center">
          <h2 className="font-serif text-xl font-semibold tracking-tight">
            This document could not be rendered
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            The file is too large to display in the browser. Ask the author for a smaller
            version.
          </p>
        </div>
      )}
    </article>
  );
}
