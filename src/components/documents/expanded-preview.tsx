"use client";

import { ZoomableDocument } from "@/components/documents/zoomable-document";
import { Maximize2, Minimize2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { renderMarkdown } from "@/lib/markdown/render";

export type ExpandedPreviewProps = {
  content: string;
  documentTitle: string;
};

/**
 * Menampilkan pratinjau Markdown dalam dialog layar penuh.
 *
 * Tidak memerlukan dokumen di-publish, jadi draft juga bisa dilihat secara
 * layar penuh langsung dari halaman pratinjau dashboard.
 */
export function ExpandedPreview({ content, documentTitle }: ExpandedPreviewProps) {
  const [open, setOpen] = useState(false);
  const [rendered, setRendered] = useState<React.ReactNode | null>(null);
  const [error, setError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Render markdown saat dialog dibuka. Rendering dilakukan di sisi klien
  // dengan pipeline yang sama seperti pratinjau biasa, sehingga outputnya
  // identik tanpa perlu publish terlebih dahulu.
  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    renderMarkdown(content)
      .then((node) => {
        if (!cancelled) {
          setRendered(node);
          setError(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setRendered(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, content]);

  // Keluar dari fullscreen browser ketika dialog ditutup.
  useEffect(() => {
    if (open) {
      return;
    }

    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {
        // Browser boleh menolak; tidak ada yang perlu dilakukan.
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

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {
        // Diabaikan: overlay sudah menutupi layar.
      });
      return;
    }

    void document.documentElement.requestFullscreen?.().catch(() => {
      // Browser menolak; overlay tetap menutupi layar.
    });
  }, []);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-xs"
      >
        <Maximize2 className="mr-1.5 size-3.5" />
        Layar penuh
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="inset-0 top-0 left-0 flex h-svh max-h-svh w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 bg-background p-0"
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3">
            <p className="min-w-0 flex-1 truncate text-sm font-medium">{documentTitle}</p>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? "Keluar layar penuh" : "Masuk layar penuh"}
              >
                {isFullscreen ? (
                  <Minimize2 className="size-4" />
                ) : (
                  <Maximize2 className="size-4" />
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                aria-label="Tutup"
              >
                <X className="size-4" />
                <span className="sr-only">Tutup</span>
              </Button>
            </div>
          </div>

          <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain">
            <div className="mx-auto w-full px-4 py-8 sm:px-6 sm:py-12">
              {error ? (
                <div className="rounded-2xl border border-dashed bg-card/60 px-6 py-12 text-center">
                  <h2 className="font-serif text-xl font-semibold tracking-tight">
                    Markdown tidak dapat dirender
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Konten terlalu besar untuk ditampilkan di browser.
                  </p>
                </div>
              ) : null}

              {rendered ? (
                <ZoomableDocument>
                  <article className="prose-doc prose max-w-none">{rendered}</article>
                </ZoomableDocument>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Memuat pratinjau…
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
