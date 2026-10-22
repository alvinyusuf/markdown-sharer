"use client";

import { Globe, Loader2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { publishDocumentAction, unpublishDocumentAction } from "@/lib/documents/actions";

type PublishToggleProps = {
  documentId: string;
  status: "draft" | "published";
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg";
  className?: string;
  label?: string;
};

/**
 * Publishes or unpublishes a document.
 *
 * The server action is the only thing that changes the status; the button only
 * reflects what the action reported.
 */
export function PublishToggle({
  documentId,
  status,
  variant,
  size = "default",
  className,
  label,
}: PublishToggleProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const isPublished = status === "published";

  function onToggle() {
    setError(null);

    startTransition(async () => {
      const result = isPublished
        ? await unpublishDocumentAction({ documentId })
        : await publishDocumentAction({ documentId });

      if (!result.ok) {
        setError(result.message);
        toast.error(result.message);
        return;
      }

      toast.success(result.message ?? "Document updated.");
      router.refresh();
    });
  }

  return (
    <div className={className}>
      <Button
        type="button"
        variant={variant ?? (isPublished ? "outline" : "default")}
        size={size}
        onClick={onToggle}
        disabled={pending}
        aria-label={label}
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : isPublished ? (
          <Lock className="size-4" />
        ) : (
          <Globe className="size-4" />
        )}
        {pending ? "Working…" : (label ?? (isPublished ? "Unpublish" : "Publish"))}
      </Button>
      {error ? (
        <p className="mt-2 text-xs text-destructive" role="status">
          {error}
        </p>
      ) : null}
    </div>
  );
}
