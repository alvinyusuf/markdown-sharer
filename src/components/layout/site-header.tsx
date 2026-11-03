import { Suspense } from "react";

import { Logo } from "@/components/layout/logo";
import { HeaderNavigation } from "@/components/layout/header-navigation";
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
          Create an account
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <LinkButton variant="ghost" size="sm" href="/dashboard">
        Dashboard
      </LinkButton>
      <div className="flex items-center gap-2 sm:rounded-full sm:border sm:bg-card sm:py-1 sm:pr-1 sm:pl-3">
        <span className="hidden max-w-40 truncate text-xs text-muted-foreground sm:block">
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
      <Skeleton className="h-11 w-16 rounded-lg sm:h-7" />
      <Skeleton className="h-11 w-32 rounded-lg sm:h-7" />
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="relative mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-4 sm:px-6 lg:gap-12 lg:px-8">
        <Logo />
        <HeaderNavigation>
          <nav
            aria-label="Main navigation"
            className="flex flex-col gap-1 text-sm text-muted-foreground md:flex-row md:items-center md:gap-6"
          >
            <Link
              href="/#how-it-works"
              className="flex min-h-11 items-center rounded-md px-3 transition-colors hover:bg-muted hover:text-foreground md:px-0 md:hover:bg-transparent"
            >
              How it works
            </Link>
            <Link
              href="/#features"
              className="flex min-h-11 items-center rounded-md px-3 transition-colors hover:bg-muted hover:text-foreground md:px-0 md:hover:bg-transparent"
            >
              Features
            </Link>
          </nav>
          <div className="border-t pt-4 md:border-0 md:pt-0">
            <Suspense fallback={<HeaderAuthFallback />}>
              <HeaderAuth />
            </Suspense>
          </div>
        </HeaderNavigation>
      </div>
    </header>
  );
}
