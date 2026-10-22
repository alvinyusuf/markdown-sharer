import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  FilePenLine,
  FileText,
  Hash,
  Info,
} from "lucide-react";

import { DocumentDetailsForm } from "@/components/documents/document-details-form";
import { SetupNotice } from "@/components/system/setup-notice";
import { Badge } from "@/components/ui/badge";
import { hasSupabaseEnv } from "@/config/env";
import { getCurrentUser } from "@/lib/auth/session";
import { getOwnDocument } from "@/lib/documents/queries";
import { renderMarkdown } from "@/lib/markdown/render";
import { formatBytes, utf8ByteLength } from "@/lib/validation/document";
import { documentIdSchema } from "@/lib/validation/schemas";
import { formatDateTime } from "@/lib/utils/date";
import { LinkButton } from "@/components/ui/link-button";

export const metadata: Metadata = {
  title: "Document preview",
  robots: { index: false, follow: false },
};

export default async function DocumentPreviewPage({
  params,
}: PageProps<"/dashboard/documents/[id]">) {
  await connection();

  if (!hasSupabaseEnv()) {
    return <SetupNotice />;
  }

  const user = await getCurrentUser();
  const { id } = await params;

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/dashboard/documents/${id}`)}`);
  }

  const parsedId = documentIdSchema.safeParse(id);
  if (!parsedId.success) {
    notFound();
  }

  const document = await getOwnDocument(user.id, parsedId.data);
  if (!document) {
    notFound();
  }

  const rendered = await renderMarkdown(document.content);

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
      >
        <ArrowLeft className="size-3.5" />
        Back to dashboard
      </Link>

      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="capitalize">
              {document.status}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Updated {formatDateTime(document.updated_at)}
            </span>
          </div>
          <h1 className="mt-3 font-serif text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">
            {document.title}
          </h1>
          {document.description ? (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {document.description}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <LinkButton variant="outline" href={`/dashboard/documents/${document.id}/edit`}>
            <FilePenLine className="size-4" />
            Edit content
          </LinkButton>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="overflow-hidden rounded-2xl border bg-card">
          <div className="flex items-center justify-between gap-3 border-b bg-muted/30 px-4 py-2.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="size-3.5" />
              Rendered preview
            </div>
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Info className="size-3" />
              Sanitized output
            </span>
          </div>
          <div className="px-5 py-8 sm:px-10 sm:py-10">
            <article className="prose-doc prose max-w-none">{rendered}</article>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border bg-card p-5">
            <h2 className="text-sm font-semibold">Document details</h2>
            <p className="mt-1 mb-4 text-xs leading-relaxed text-muted-foreground">
              Changing the title keeps the same document and slug.
            </p>
            <DocumentDetailsForm
              documentId={document.id}
              title={document.title}
              description={document.description ?? ""}
            />
          </div>

          <div className="rounded-2xl border bg-card p-5 text-sm">
            <h2 className="text-sm font-semibold">Metadata</h2>
            <dl className="mt-4 space-y-3 text-xs">
              <div className="flex items-start justify-between gap-3">
                <dt className="flex items-center gap-1.5 text-muted-foreground">
                  <Hash className="size-3.5" />
                  Slug
                </dt>
                <dd className="max-w-44 truncate font-mono text-[11px]">
                  {document.slug}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="flex items-center gap-1.5 text-muted-foreground">
                  <FileText className="size-3.5" />
                  Size
                </dt>
                <dd>{formatBytes(utf8ByteLength(document.content))}</dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="flex items-center gap-1.5 text-muted-foreground">
                  <CalendarDays className="size-3.5" />
                  Created
                </dt>
                <dd>{formatDateTime(document.created_at)}</dd>
              </div>
            </dl>
            <div className="mt-4 rounded-lg border border-amber-200/80 bg-amber-50 px-3 py-2.5 text-[11px] leading-relaxed text-amber-900">
              <p className="flex items-center gap-1.5 font-medium">
                <ExternalLink className="size-3" />
                Not public yet
              </p>
              <p className="mt-1 text-amber-900/80">
                Publishing and public links arrive in the next milestone. Only you can
                open this draft.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export const instant = false;
