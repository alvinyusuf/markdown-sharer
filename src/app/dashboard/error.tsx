"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <div className="rounded-2xl border bg-card px-6 py-14 text-center">
      <div className="mx-auto flex size-11 items-center justify-center rounded-xl border bg-background">
        <TriangleAlert className="size-5 text-amber-700" />
      </div>
      <h2 className="mt-5 font-serif text-2xl font-semibold tracking-tight">
        We couldn&apos;t load your documents
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        This can happen when the database is unreachable or your session expired.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Button onClick={reset}>
          <RotateCcw className="size-4" />
          Try again
        </Button>
        <LinkButton variant="outline" href="/login">
          Sign in again
        </LinkButton>
      </div>
    </div>
  );
}
