import type { Metadata } from "next";
import Link from "next/link";

import { Logo } from "@/components/layout/logo";

export default function PublicLayout({ children }: LayoutProps<"/p">) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo />
          <Link
            href="/"
            className="rounded-md text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
          >
            Readmeo
          </Link>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t bg-card/40">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-start justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:px-6">
          <p>Shared with Readmeo.</p>
          <Link
            href="/"
            className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Turn your Markdown into a shareable page
          </Link>
        </div>
      </footer>
    </div>
  );
}

export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
  },
};
