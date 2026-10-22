"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl border bg-card shadow-sm">
        <TriangleAlert className="size-5 text-amber-700" />
      </div>
      <h1 className="mt-6 font-serif text-3xl font-semibold tracking-tight">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        We hit an unexpected error while loading this page. Try again in a moment.
      </p>
      <Button className="mt-6" onClick={reset}>
        <RotateCcw className="size-4" />
        Try again
      </Button>
    </div>
  );
}
