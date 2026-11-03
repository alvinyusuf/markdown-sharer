"use client";

import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import type { Root } from "hast";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Maximize2,
  Minimize2,
  TriangleAlert,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { markdownComponents } from "@/lib/markdown/components";
import type { DocumentSection } from "@/lib/markdown/sections";

export type PresentationViewerProps = {
  slug: string;
  documentTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Status = "loading" | "ready" | "error";

function renderSection(tree: Root) {
  return toJsxRuntime(tree, {
    Fragment,
    jsx,
    jsxs,
    components: markdownComponents,
  });
}

/**
 * The presentation overlay.
 *
 * It shows the document one section at a time. The sections come from the
 * same sanitized tree as the normal view, so nothing about the content
 * changes, only the way it is displayed.
 */
export function PresentationViewer({
  slug,
  documentTitle,
  open,
  onOpenChange,
}: PresentationViewerProps) {
  const [sections, setSections] = useState<DocumentSection[] | null>(null);
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<Status>("loading");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    fetch(`/p/${encodeURIComponent(slug)}/sections`, {
      headers: { accept: "application/json" },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("unavailable");
        }

        return (await response.json()) as { sections: DocumentSection[] };
      })
      .then((data) => {
        if (cancelled) {
          return;
        }

        setSections(data.sections);
        setIndex(0);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, slug]);

  // Leave fullscreen when the presentation is closed.
  useEffect(() => {
    if (open) {
      return;
    }

    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {
        // The browser may refuse to leave fullscreen. Nothing else to do.
      });
    }
  }, [open]);

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const total = sections?.length ?? 0;

  const goNext = useCallback(() => {
    setIndex((current) => (total > 0 ? Math.min(current + 1, total - 1) : current));
  }, [total]);

  const goPrevious = useCallback(() => {
    setIndex((current) => Math.max(current - 1, 0));
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrevious();
      }
    }

    // The dialog stops key events from bubbling, so the listener is
    // registered while the event is still on its way down.
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [open, goNext, goPrevious]);

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {
        // Ignored: the overlay is already full viewport.
      });
      return;
    }

    void document.documentElement.requestFullscreen?.().catch(() => {
      // The browser refused. The overlay covers the screen anyway.
    });
  }

  const section = sections?.[index];
  const progress = total > 0 ? ((index + 1) / total) * 100 : 0;

  function handleOpenChange(next: boolean) {
    if (!next) {
      // Reset for the next run instead of showing the previous one while the
      // sections are loaded again.
      setStatus("loading");
      setSections(null);
      setIndex(0);
    }

    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="inset-0 top-0 left-0 flex h-svh max-h-svh w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 bg-background p-0"
      >
        <DialogTitle className="sr-only">{documentTitle} — presentation</DialogTitle>

        <header className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3">
          <p className="min-w-0 flex-1 truncate text-sm font-medium">{documentTitle}</p>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Leave fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="size-4" />
            ) : (
              <Maximize2 className="size-4" />
            )}
          </Button>
        </header>

        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
            {status === "loading" ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Preparing the presentation…
              </div>
            ) : null}

            {status === "error" ? (
              <div className="rounded-2xl border border-dashed bg-card/60 px-6 py-12 text-center">
                <TriangleAlert className="mx-auto size-5 text-muted-foreground" />
                <h2 className="mt-3 font-serif text-xl font-semibold tracking-tight">
                  The presentation could not be loaded
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  The document is not available any more. Close this and open the document
                  again.
                </p>
              </div>
            ) : null}

            {status === "ready" && section ? (
              <article
                key={section.id}
                className="prose-doc prose max-w-none"
                aria-live="polite"
              >
                {renderSection(section.tree)}
              </article>
            ) : null}
          </div>
        </div>

        <footer className="flex shrink-0 flex-col items-stretch gap-2 border-t bg-background/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
            {section?.title ?? documentTitle}
          </p>

          <div className="flex items-center justify-between gap-2 sm:justify-start">
            <div className="mr-1 hidden items-center gap-2 sm:flex">
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {total > 0 ? `${index + 1} / ${total}` : "—"}
              </span>
              <div
                className="h-1 w-24 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuemin={1}
                aria-valuemax={Math.max(total, 1)}
                aria-valuenow={total > 0 ? index + 1 : 0}
                aria-label="Presentation progress"
              >
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <span className="font-mono text-xs text-muted-foreground tabular-nums sm:hidden">
              {total > 0 ? `${index + 1} / ${total}` : "—"}
            </span>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-11"
              onClick={goPrevious}
              disabled={status !== "ready" || index === 0}
              aria-label="Previous section"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-11"
              onClick={goNext}
              disabled={status !== "ready" || index >= total - 1}
              aria-label="Next section"
            >
              <ChevronRight className="size-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-11"
              onClick={() => onOpenChange(false)}
              aria-label="Exit presentation"
            >
              <X className="size-5" />
            </Button>
          </div>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
