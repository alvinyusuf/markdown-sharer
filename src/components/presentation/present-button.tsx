"use client";

import { Presentation } from "lucide-react";
import { useState, type ComponentType } from "react";

import { Button } from "@/components/ui/button";
import type { PresentationViewerProps } from "@/components/presentation/presentation-viewer";

/**
 * Starts a presentation.
 *
 * The viewer is imported on demand so the presentation renderer never ends
 * up in the bundle of a reader who only wants to read the document.
 */
export function PresentButton({
  slug,
  documentTitle,
}: {
  slug: string;
  documentTitle: string;
}) {
  const [Viewer, setViewer] = useState<ComponentType<PresentationViewerProps> | null>(
    null,
  );
  const [open, setOpen] = useState(false);

  async function onPresent() {
    // Ask for fullscreen while the click still counts as a user gesture.
    // Browsers that refuse still get the full viewport overlay.
    if (
      typeof document !== "undefined" &&
      document.documentElement.requestFullscreen &&
      !document.fullscreenElement
    ) {
      void document.documentElement.requestFullscreen().catch(() => {
        // The browser refused. The overlay covers the screen anyway.
      });
    }

    if (!Viewer) {
      const viewerModule = await import("@/components/presentation/presentation-viewer");
      setViewer(() => viewerModule.PresentationViewer);
    }

    setOpen(true);
  }

  return (
    <>
      <Button type="button" variant="ghost" onClick={() => void onPresent()}>
        <Presentation className="size-4" />
        Present
      </Button>

      {Viewer ? (
        <Viewer
          slug={slug}
          documentTitle={documentTitle}
          open={open}
          onOpenChange={setOpen}
        />
      ) : null}
    </>
  );
}
