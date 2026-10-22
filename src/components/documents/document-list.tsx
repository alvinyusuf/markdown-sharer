import { ArrowRight, FilePlus2, FileText, Upload } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/date";
import type { DocumentSummary } from "@/types/database";
import { LinkButton } from "@/components/ui/link-button";

function EmptyState() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed bg-card/60 px-6 py-16 text-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_80%_at_50%_0%,oklch(0.94_0.03_155/60%),transparent_70%)]"
      />
      <div className="relative mx-auto flex max-w-md flex-col items-center">
        <div className="flex size-12 items-center justify-center rounded-2xl border bg-background shadow-sm">
          <FileText className="size-5 text-muted-foreground" />
        </div>
        <h2 className="mt-5 font-serif text-2xl font-semibold tracking-tight">
          No documents yet
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Upload a Markdown file to create your first draft. You can preview it before
          anyone else sees it.
        </p>
        <LinkButton className="mt-6" href="/dashboard/new">
          <Upload className="size-4" />
          Upload Markdown
        </LinkButton>
        <p className="mt-3 text-xs text-muted-foreground">
          .md or .markdown · up to 2 MB
        </p>
      </div>
    </div>
  );
}

export function DocumentList({ documents }: { documents: DocumentSummary[] }) {
  if (documents.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <div className="hidden grid-cols-[minmax(0,1fr)_120px_140px_88px] gap-4 border-b bg-muted/40 px-5 py-2.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase sm:grid">
        <span>Document</span>
        <span>Status</span>
        <span>Updated</span>
        <span className="text-right">Open</span>
      </div>
      <ul className="divide-y">
        {documents.map((document) => (
          <li key={document.id}>
            <div className="group grid gap-3 px-5 py-4 transition-colors hover:bg-muted/30 sm:grid-cols-[minmax(0,1fr)_120px_140px_88px] sm:items-center sm:gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background">
                  <FileText className="size-4 text-muted-foreground" />
                </span>
                <div className="min-w-0">
                  <Link
                    href={`/dashboard/documents/${document.id}`}
                    className="block truncate text-sm font-medium underline-offset-4 hover:underline"
                  >
                    {document.title}
                  </Link>
                  <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                    /p/{document.slug}
                  </p>
                  {document.description ? (
                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                      {document.description}
                    </p>
                  ) : null}
                </div>
              </div>

              <div>
                <Badge
                  variant={document.status === "published" ? "default" : "secondary"}
                  className="capitalize"
                >
                  {document.status}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground">
                {formatDate(document.updated_at)}
              </p>

              <div className="sm:text-right">
                <LinkButton variant="ghost" size="sm" className="group/button" href={`/dashboard/documents/${document.id}`}>
                  Open
                  <ArrowRight className="size-3.5 transition-transform group-hover/button:translate-x-0.5" />
                </LinkButton>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between gap-3 border-t bg-muted/20 px-5 py-3">
        <p className="text-xs text-muted-foreground">
          {documents.length === 1 ? "1 document" : `${documents.length} documents`}
        </p>
        <LinkButton variant="outline" size="sm" href="/dashboard/new">
          <FilePlus2 className="size-3.5" />
          New document
        </LinkButton>
      </div>
    </div>
  );
}
