import { Suspense } from "react";

import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/auth/session";
import { signOutAction } from "@/lib/auth/actions";
import Link from "next/link";

async function HeaderAuth() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex items-center gap-1.5">
        <LinkButton variant="ghost" size="sm" href="/login">
          Sign in
        </LinkButton>
        <LinkButton size="sm" href="/signup">
          Get started
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <LinkButton variant="ghost" size="sm" href="/dashboard">
        Dashboard
      </LinkButton>
      <div className="hidden items-center gap-2 rounded-full border bg-card py-1 pr-1 pl-3 sm:flex">
        <span className="max-w-40 truncate text-xs text-muted-foreground">
          {user.email}
        </span>
        <form action={signOutAction}>
          <Button type="submit" variant="ghost" size="icon-xs" aria-label="Sign out">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="size-3.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 4H5v16h4M16 8l4 4-4 4M20 12H9" />
            </svg>
          </Button>
        </form>
      </div>
    </div>
  );
}

function HeaderAuthFallback() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-7 w-20 rounded-lg" />
      <Skeleton className="h-7 w-24 rounded-lg" />
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link href="/#how-it-works" className="transition-colors hover:text-foreground">
            How it works
          </Link>
          <Link href="/#features" className="transition-colors hover:text-foreground">
            Features
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Suspense fallback={<HeaderAuthFallback />}>
            <HeaderAuth />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
