import Link from "next/link";
import type { ReactNode } from "react";

import { Logo } from "@/components/layout/logo";

export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-7">{children}</div>
      {footer ? (
        <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
      ) : null}
    </div>
  );
}

export function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-col">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(60%_100%_at_50%_0%,oklch(0.93_0.045_264/55%),transparent_75%)]"
      />
      <div className="relative flex items-center justify-between px-4 py-5 sm:px-6">
        <Logo />
        <Link
          href="/"
          className="rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
        >
          Back home
        </Link>
      </div>
      <main className="relative flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        {children}
      </main>
    </div>
  );
}
