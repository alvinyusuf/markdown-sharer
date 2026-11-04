"use client";

import { Minus, Plus, RotateCcw } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";

/** Adjust the reading column width while keeping text at its normal size. */
export function ZoomableDocument({
  children,
  presentation = false,
}: {
  children: ReactNode;
  presentation?: boolean;
}) {
  const [zoom, setZoom] = useState(100);

  function changeZoom(value: number) {
    setZoom(Math.min(200, Math.max(50, value)));
  }

  return (
    <div
      className="mx-auto w-full min-w-0"
      style={{ maxWidth: `${(45 * zoom) / 100}rem` }}
    >
      <div
        role="group"
        aria-label="Document width"
        className={`fixed right-[max(0.75rem,env(safe-area-inset-right))] z-40 flex max-w-[calc(100vw-1.5rem)] flex-wrap items-center justify-end gap-1 rounded-xl bg-background p-2 shadow-lg ring-1 ring-foreground/10 ${
          presentation
            ? "bottom-[calc(8rem+env(safe-area-inset-bottom))] sm:bottom-[calc(5rem+env(safe-area-inset-bottom))]"
            : "bottom-[max(0.75rem,env(safe-area-inset-bottom))]"
        }`}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Decrease document width"
          title="Decrease document width"
          disabled={zoom === 50}
          onClick={() => changeZoom(zoom - 10)}
        >
          <Minus className="size-4" />
        </Button>
        <input
          type="range"
          min={50}
          max={200}
          step={10}
          value={zoom}
          onChange={(event) => changeZoom(Number(event.target.value))}
          aria-label="Document width"
          aria-valuetext={`${zoom}%`}
          className="h-11 w-20 shrink-0 cursor-pointer accent-primary focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:w-28"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Increase document width"
          title="Increase document width"
          disabled={zoom === 200}
          onClick={() => changeZoom(zoom + 10)}
        >
          <Plus className="size-4" />
        </Button>
        <output className="w-12 text-center text-xs tabular-nums" aria-live="polite">
          {zoom}%
        </output>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={zoom === 100}
          onClick={() => changeZoom(100)}
          aria-label="Reset document width to 100%"
          title="Reset document width to 100%"
        >
          <RotateCcw className="size-3.5" />
          Reset
        </Button>
      </div>
      <div
        className="overflow-x-auto overscroll-x-contain pb-24 focus-visible:outline-2 focus-visible:outline-ring"
        role="region"
        aria-label="Document content"
        tabIndex={0}
      >
        {children}
      </div>
    </div>
  );
}
