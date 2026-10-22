import Link from "next/link";

import { Logo } from "@/components/layout/logo";

export function SiteFooter() {
  return (
    <footer className="border-t bg-card/40">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-6 px-4 py-10 sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <div className="space-y-2">
          <Logo />
          <p className="max-w-sm text-sm text-muted-foreground">
            Markdown in. A clean, readable page out. Built for documentation, notes, and
            proposals.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link href="/dashboard" className="transition-colors hover:text-foreground">
            Dashboard
          </Link>
          <Link href="/login" className="transition-colors hover:text-foreground">
            Sign in
          </Link>
          <Link href="/signup" className="transition-colors hover:text-foreground">
            Create account
          </Link>
        </div>
      </div>
    </footer>
  );
}
