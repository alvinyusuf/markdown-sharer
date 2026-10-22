import Link from "next/link";

import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
        className,
      )}
      aria-label="MarkdownShare home"
    >
      <span className="relative flex size-8 items-center justify-center rounded-[10px] bg-primary text-primary-foreground shadow-sm transition-transform group-hover:-translate-y-0.5">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="size-[18px]"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 3.75h8.5L19 8.25v12H6z" />
          <path d="M14 3.75v4.5h4.5" />
          <path d="M9 12.5h6M9 15.5h6M9 18h3.5" />
        </svg>
      </span>
      <span className="text-[15px] font-semibold tracking-tight">
        Markdown<span className="text-muted-foreground">Share</span>
      </span>
    </Link>
  );
}
