"use client";

import { Check, Copy, Loader2, TriangleAlert } from "lucide-react";
import { useEffect, useId, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";

type DiagramState =
  | { status: "loading" }
  | { status: "ready"; svg: string }
  | { status: "error"; message: string };

/** Every render attempt gets its own id, also in development Strict Mode. */
let renderCounter = 0;

function textOf(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }

  if (Array.isArray(children)) {
    return children.map(textOf).join("");
  }

  return "";
}

/** Mermaid namespaces its CSS with the id of the SVG, so it has to be a valid selector. */
function safeId(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, "") || "diagram";
}

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "The diagram could not be rendered.";
}

/**
 * Draws a Mermaid diagram in the browser.
 *
 * Mermaid has no server side renderer without a headless browser, so the
 * diagram is drawn on the client. The library itself is imported on demand,
 * which keeps it out of the bundle of every page that has no diagram.
 *
 * The SVG that Mermaid returns is inserted as it is. It is not HTML from the
 * document: Mermaid builds it from the diagram source and, with
 * `securityLevel: "strict"`, runs it through DOMPurify before returning it.
 * The source itself never contains HTML, because the Markdown pipeline keeps
 * it as plain text.
 */
export function MermaidDiagram({ children }: { children?: ReactNode }) {
  const reactId = useId();
  const chart = textOf(children).trim();
  const isEmpty = chart.length === 0;
  const [state, setState] = useState<DiagramState>({ status: "loading" });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isEmpty) {
      return;
    }

    let cancelled = false;
    let container: HTMLDivElement | null = null;
    const id = `mermaid-${safeId(reactId)}-${renderCounter++}`;

    async function draw() {
      try {
        const { default: mermaid } = await import("mermaid");

        mermaid.initialize({
          startOnLoad: false,
          // "strict" keeps Mermaid from adding scripts, click handlers, and
          // HTML labels. The SVG is sanitized with DOMPurify before it is
          // returned.
          securityLevel: "strict",
          // A broken diagram must not leave an error drawing in the page.
          suppressErrorRendering: true,
          theme: "neutral",
          fontFamily: "var(--font-geist-sans)",
          htmlLabels: false,
          flowchart: { htmlLabels: false, useMaxWidth: true },
          maxTextSize: 50_000,
        });

        // Mermaid measures the diagram while it draws it, so the container has
        // to be in the document. It is kept off screen so nothing flickers
        // while the diagram is rendered.
        container = document.createElement("div");
        container.setAttribute("aria-hidden", "true");
        container.style.position = "fixed";
        container.style.top = "-9999px";
        container.style.left = "-9999px";
        container.style.width = "800px";
        document.body.appendChild(container);

        const { svg } = await mermaid.render(id, chart, container);

        if (!cancelled) {
          setState({ status: "ready", svg });
        }
      } catch (error) {
        if (!cancelled) {
          setState({ status: "error", message: errorMessage(error) });
        }
      } finally {
        container?.remove();
        // Mermaid removes its temporary elements itself, but a failed render
        // can leave one behind.
        document.getElementById(id)?.remove();
        document.getElementById(`d${id}`)?.remove();
      }
    }

    void draw();

    return () => {
      cancelled = true;
      container?.remove();
    };
  }, [chart, reactId, isEmpty]);

  async function copySource() {
    try {
      await navigator.clipboard.writeText(chart);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  const view: DiagramState = isEmpty
    ? { status: "error", message: "This diagram is empty." }
    : state;

  return (
    <figure className="mermaid-figure">
      <figcaption className="flex items-center justify-between gap-3 border-b bg-muted/40 px-4 py-2">
        <span className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
          Diagram
        </span>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => void copySource()}
          className="text-muted-foreground hover:text-foreground"
          aria-label={copied ? "Copied" : "Copy diagram source"}
        >
          {copied ? <Check /> : <Copy />}
          {copied ? "Copied" : "Source"}
        </Button>
      </figcaption>

      {view.status === "loading" ? (
        <div className="flex items-center gap-2 px-4 py-8 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Drawing the diagram…
        </div>
      ) : null}

      {view.status === "error" ? (
        <div className="space-y-3 px-4 py-5">
          <p className="flex items-start gap-2 text-sm text-destructive">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            <span>
              This diagram could not be drawn. The source is kept below.
              <span className="mt-1 block text-xs text-muted-foreground">
                {view.message}
              </span>
            </span>
          </p>
          <pre className="thin-scrollbar overflow-x-auto rounded-lg border bg-muted/40 p-3 font-mono text-[12px] leading-relaxed text-foreground">
            {chart}
          </pre>
        </div>
      ) : null}

      {view.status === "ready" ? (
        <div
          className="mermaid-figure-canvas overflow-x-auto px-4 py-6 sm:px-6"
          // The SVG is produced by Mermaid from a source that is plain text,
          // and Mermaid sanitizes it with DOMPurify before returning it.
          dangerouslySetInnerHTML={{ __html: view.svg }}
        />
      ) : null}
    </figure>
  );
}
