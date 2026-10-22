"use client";

import { AlertCircle, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateDocumentMetadataAction } from "@/lib/documents/actions";
import { MAX_DESCRIPTION_LENGTH, MAX_TITLE_LENGTH } from "@/lib/validation/document";

export function DocumentDetailsForm({
  documentId,
  title: initialTitle,
  description: initialDescription,
}: {
  documentId: string;
  title: string;
  description: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[] | undefined>>();
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors(undefined);

    startTransition(async () => {
      const result = await updateDocumentMetadataAction({
        documentId,
        title,
        description,
      });

      if (!result.ok) {
        setError(result.message);
        setFieldErrors(result.fieldErrors);
        return;
      }

      toast.success(result.message ?? "Document details saved.");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="document-title">Title</Label>
        <Input
          id="document-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={MAX_TITLE_LENGTH}
          required
          aria-invalid={Boolean(fieldErrors?.title)}
        />
        {fieldErrors?.title ? (
          <p className="text-xs text-destructive">{fieldErrors.title[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="document-description">
          Description{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="document-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={MAX_DESCRIPTION_LENGTH}
          rows={4}
          aria-invalid={Boolean(fieldErrors?.description)}
        />
        <div className="flex justify-between gap-2">
          {fieldErrors?.description ? (
            <p className="text-xs text-destructive">{fieldErrors.description[0]}</p>
          ) : (
            <span />
          )}
          <p className="text-right text-xs text-muted-foreground">
            {description.length}/{MAX_DESCRIPTION_LENGTH}
          </p>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Saving…
          </>
        ) : (
          <>
            <Save className="size-4" />
            Save details
          </>
        )}
      </Button>
    </form>
  );
}
