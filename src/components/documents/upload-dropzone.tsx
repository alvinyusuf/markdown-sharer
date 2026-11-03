"use client";

import { AlertCircle, FileText, Loader2, Upload, X } from "lucide-react";
import { useRef, useState, useTransition, type DragEvent } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createDemoDocumentAction, createDraftAction } from "@/lib/documents/actions";
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_FILE_SIZE_BYTES,
  MAX_TITLE_LENGTH,
  decodeMarkdown,
  formatBytes,
  titleFromFileName,
  validateMarkdownFile,
} from "@/lib/validation/document";
import { cn } from "@/lib/utils";

type SelectedFile = {
  name: string;
  size: number;
  content: string;
  words: number;
};

type ReadingState = "idle" | "reading" | "ready";

export function UploadDropzone({ demo = false }: { demo?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [readingState, setReadingState] = useState<ReadingState>("idle");
  const [file, setFile] = useState<SelectedFile | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function resetFile() {
    setFile(null);
    setTitle("");
    setDescription("");
    setError(null);
    setReadingState("idle");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function handleFile(candidate: File | undefined) {
    if (!candidate) {
      return;
    }

    setError(null);

    const validation = validateMarkdownFile(candidate);
    if (!validation.ok) {
      setError(validation.message);
      setReadingState("idle");
      return;
    }

    setReadingState("reading");

    try {
      const buffer = await candidate.arrayBuffer();
      const decoded = decodeMarkdown(buffer);

      if (!decoded.ok) {
        setError(decoded.message);
        setReadingState("idle");
        return;
      }

      const words = decoded.content.trim().split(/\s+/).filter(Boolean).length;
      setFile({
        name: candidate.name,
        size: candidate.size,
        content: decoded.content,
        words,
      });
      setTitle(titleFromFileName(candidate.name));
      setReadingState("ready");
    } catch {
      setError("We couldn't read this file. Try saving it again and re-uploading.");
      setReadingState("idle");
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);

    if (event.dataTransfer.files.length > 1) {
      setError("Upload one file at a time.");
      return;
    }

    void handleFile(event.dataTransfer.files[0]);
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError("Choose a Markdown file first.");
      return;
    }

    if (!title.trim()) {
      setError("Add a title for this document.");
      return;
    }

    setError(null);

    startTransition(async () => {
      const createAction = demo ? createDemoDocumentAction : createDraftAction;
      const result = await createAction({
        title: title.trim(),
        description: description.trim(),
        content: file.content,
        originalFileName: file.name,
      });

      if (result && !result.ok) {
        setError(result.message);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          if (event.currentTarget.contains(event.relatedTarget as Node)) {
            return;
          }
          setDragging(false);
        }}
        onDrop={onDrop}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-12 text-center transition-colors sm:py-16",
          dragging
            ? "border-emerald-700/50 bg-emerald-50/70"
            : "border-border bg-card/60 hover:border-border/80 hover:bg-card",
          file ? "py-8 sm:py-9" : "",
        )}
      >
        <input
          ref={inputRef}
          id="markdown-file"
          type="file"
          accept=".md,.markdown,text/markdown,text/plain"
          className="sr-only"
          onChange={(event) => void handleFile(event.target.files?.[0])}
        />

        {file ? (
          <div className="w-full max-w-lg text-left">
            <div className="flex items-start gap-3 rounded-xl border bg-background p-4 shadow-sm">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800">
                <FileText className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatBytes(file.size)} · {file.words.toLocaleString("en-US")} words
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={resetFile}
                aria-label="Remove file"
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                File read as UTF-8 and validated on your device.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => inputRef.current?.click()}
              >
                Replace file
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex size-12 items-center justify-center rounded-2xl border bg-background shadow-sm">
              {readingState === "reading" ? (
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              ) : (
                <Upload className="size-5 text-muted-foreground" />
              )}
            </div>
            <h2 className="mt-5 text-base font-semibold">
              {readingState === "reading"
                ? "Reading your file…"
                : "Drop your Markdown file here"}
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              or{" "}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="font-medium text-foreground underline underline-offset-4"
              >
                choose a file
              </button>{" "}
              from your device
            </p>
            <p className="mt-4 font-mono text-[11px] text-muted-foreground">
              .md or .markdown · max {formatBytes(MAX_FILE_SIZE_BYTES)}
            </p>
          </>
        )}
      </div>

      {error ? (
        <Alert variant="destructive" aria-live="polite">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {file ? (
        <div className="grid gap-6 rounded-2xl border bg-card p-5 sm:p-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={MAX_TITLE_LENGTH}
              required
              placeholder="Document title"
            />
            <p className="text-xs text-muted-foreground">
              Suggested from the file name. Choose a title before uploading.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={MAX_DESCRIPTION_LENGTH}
              rows={3}
              placeholder="A short summary shown above the document."
            />
            <p className="text-right text-xs text-muted-foreground">
              {description.length}/{MAX_DESCRIPTION_LENGTH}
            </p>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-xs text-muted-foreground">
          {demo
            ? "Creates a public link. Automatically deleted after 24 hours."
            : "This creates a private draft. Nothing is public yet."}
        </p>
        <Button
          type="submit"
          className="h-10 px-5"
          disabled={!file || pending || readingState === "reading"}
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {demo ? "Uploading document…" : "Creating draft…"}
            </>
          ) : demo ? (
            "Upload & preview"
          ) : (
            "Create draft & preview"
          )}
        </Button>
      </div>
    </form>
  );
}
