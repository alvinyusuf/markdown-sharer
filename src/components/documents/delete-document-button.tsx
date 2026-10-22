"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteDocumentAction } from "@/lib/documents/actions";

type DeleteDocumentButtonProps = {
  documentId: string;
  documentTitle: string;
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm";
  label?: string;
  iconOnly?: boolean;
  className?: string;
};

/**
 * Deletes a document after an explicit confirmation.
 *
 * The action is the only thing that removes the row, so the button only
 * reflects what the action reported.
 */
export function DeleteDocumentButton({
  documentId,
  documentTitle,
  variant = "ghost",
  size = "icon-sm",
  label = "Delete document",
  iconOnly = true,
  className,
}: DeleteDocumentButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function onConfirm() {
    setError(null);

    startTransition(async () => {
      const result = await deleteDocumentAction({ documentId });

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setOpen(false);
      toast.success(result.message ?? "Document deleted.");
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            type="button"
            variant={variant}
            size={size}
            className={className}
            aria-label={iconOnly ? `${label}: ${documentTitle}` : label}
          />
        }
      >
        <Trash2 className="size-4" />
        {iconOnly ? null : <span>{label}</span>}
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this document?</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-medium text-foreground">{documentTitle}</span> will be
            removed permanently. This cannot be undone, and the public link stops working
            right away.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={pending} onClick={onConfirm}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {pending ? "Deleting…" : "Delete document"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
