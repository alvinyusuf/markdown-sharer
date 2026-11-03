"use client";

import { AlertCircle, ArrowLeft, FileText, Loader2, Save, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  MAX_CONTENT_BYTES,
  decodeMarkdown,
  formatBytes,
  utf8ByteLength,
  validateMarkdownFile,
} from "@/lib/validation/document";
import { updateDocumentContentAction } from "@/lib/documents/actions";
import { LinkButton } from "@/components/ui/link-button";

export function DocumentContentForm({
  documentId,
  initialContent,
}: {
  documentId: string;
  initialContent: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState<string | null>(null);
  const [uploadedName, setUploadedName] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const byteLength = utf8ByteLength(content);
  const dirty = content !== initialContent;

  async function onFile(file: File | undefined) {
    if (!file) {
      return;
    }

    setError(null);

    const validation = validateMarkdownFile(file);
    if (!validation.ok) {
      setError(validation.message);
      return;
    }

    try {
      const decoded = decodeMarkdown(await file.arrayBuffer());
      if (!decoded.ok) {
        setError(decoded.message);
        return;
      }

      setContent(decoded.content);
      setUploadedName(file.name);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch {
      setError("We couldn't read that file. Try again.");
    }
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (byteLength > MAX_CONTENT_BYTES) {
      setError("The document content must be 2 MB or smaller.");
      return;
    }

    if (!content.trim()) {
      setError("The document content cannot be empty.");
      return;
    }

    startTransition(async () => {
      const result = await updateDocumentContentAction({ documentId, content });

      if (!result.ok) {
        setError(result.message);
        return;
      }

      toast.success("Content saved.");
      router.push(`/dashboard/documents/${documentId}`);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error ? (
        <Alert variant="destructive" aria-live="polite">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/40 px-4 py-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <FileText className="size-3.5" />
            <span className="font-mono">
              {byteLength > 0 ? formatBytes(byteLength) : "0 B"}
            </span>
            <span aria-hidden="true">·</span>
            <span>max 2 MB</span>
            {uploadedName ? (
              <>
                <span aria-hidden="true">·</span>
                <span className="max-w-52 truncate">Replaced with {uploadedName}</span>
              </>
            ) : null}
          </div>
          <div>
            <input
              ref={inputRef}
              type="file"
              accept=".md,.markdown,text/markdown,text/plain"
              className="sr-only"
              onChange={(event) => void onFile(event.target.files?.[0])}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="size-3.5" />
              Replace with file
            </Button>
          </div>
        </div>

        <label htmlFor="markdown-content" className="sr-only">
          Markdown content
        </label>
        <textarea
          id="markdown-content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          spellCheck={false}
          className="thin-scrollbar min-h-[50svh] w-full resize-y bg-transparent px-4 py-4 font-mono text-base leading-relaxed outline-none focus-visible:ring-3 focus-visible:ring-ring/20 focus-visible:ring-inset sm:min-h-[520px] sm:px-5 sm:text-sm"
        />
      </div>

      <div className="flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <LinkButton variant="ghost" href={`/dashboard/documents/${documentId}`}>
          <ArrowLeft className="size-4" />
          Back to preview
        </LinkButton>
        <Button type="submit" className="h-10 px-5" disabled={pending || !dirty}>
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="size-4" />
              Save & preview
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
