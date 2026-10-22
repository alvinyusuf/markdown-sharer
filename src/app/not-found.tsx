import { FileQuestion } from "lucide-react";
import { LinkButton } from "@/components/ui/link-button";


export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl border bg-card shadow-sm">
        <FileQuestion className="size-5 text-muted-foreground" />
      </div>
      <p className="mt-6 font-mono text-xs tracking-widest text-muted-foreground">404</p>
      <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight">
        This page doesn&apos;t exist
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        The link may be broken, or the document may have been removed.
      </p>
      <div className="mt-6 flex gap-3">
        <LinkButton href="/">Go home</LinkButton>
        <LinkButton variant="outline" href="/dashboard">
          Dashboard
        </LinkButton>
      </div>
    </div>
  );
}
