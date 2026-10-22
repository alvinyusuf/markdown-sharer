import { FileQuestion } from "lucide-react";

import { LinkButton } from "@/components/ui/link-button";

/**
 * Shown when a public link cannot be opened.
 *
 * The message never reveals whether the document exists as a draft, was
 * unpublished, or never existed.
 */
export default function PublicDocumentNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-28">
      <div className="flex size-12 items-center justify-center rounded-2xl border bg-card shadow-sm">
        <FileQuestion className="size-5 text-muted-foreground" />
      </div>
      <p className="mt-6 font-mono text-xs tracking-widest text-muted-foreground">404</p>
      <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-balance">
        This document isn&apos;t available
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        The link may be broken, or the author may have unpublished the document. Ask the
        author for a new link.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <LinkButton href="/">Go home</LinkButton>
        <LinkButton variant="outline" href="/dashboard">
          Dashboard
        </LinkButton>
      </div>
    </div>
  );
}
