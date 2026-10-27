import Link from "next/link";

import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M9 4.25h8.4a2 2 0 0 1 1.42.59l4.34 4.34a2 2 0 0 1 .59 1.42V25.5a2.25 2.25 0 0 1-2.25 2.25H9a2.25 2.25 0 0 1-2.25-2.25V6.5A2.25 2.25 0 0 1 9 4.25Z"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinejoin="round"
      />
      <path
        d="M17.5 4.5v4.25a1.75 1.75 0 0 0 1.75 1.75h4.25"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinejoin="round"
      />
      <path
        d="M12.4 20.2v-5.1"
        stroke="#2450E6"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M16.4 20.2v-2.6"
        stroke="#334155"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M20.4 20.2v-6.2"
        stroke="#6C8CF5"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({
  className,
  showTagline = false,
}: {
  className?: string;
  showTagline?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
        className,
      )}
      aria-label="Readmeo home"
    >
      <LogoMark className="size-8 shrink-0 transition-transform group-hover:-translate-y-0.5" />
      <span className="flex flex-col">
        <span className="text-[17px] leading-none font-semibold tracking-tight">
          Read<span className="text-muted-foreground">meo</span>
        </span>
        {showTagline ? (
          <span className="mt-1 text-[10px] leading-none font-medium tracking-[0.08em] text-muted-foreground">
            by Neoprism
          </span>
        ) : null}
      </span>
    </Link>
  );
}
