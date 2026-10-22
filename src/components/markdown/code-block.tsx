"use client";

import { Check, Copy } from "lucide-react";
import { useRef, useState, type ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CodeBlock({ className, children, ...props }: ComponentProps<"pre">) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    const text = preRef.current?.textContent ?? "";
    if (!text) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="group/code relative my-6 overflow-hidden rounded-xl border border-zinc-800 bg-[#0d1117]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <span className="font-mono text-[11px] tracking-wide text-zinc-400 uppercase">
          Code
        </span>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={copyCode}
          className="text-zinc-400 hover:bg-white/10 hover:text-white"
          aria-label={copied ? "Copied" : "Copy code"}
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre
        ref={preRef}
        className={cn(
          "overflow-x-auto p-4 text-[13px] leading-relaxed text-zinc-100",
          className,
        )}
        {...props}
      >
        {children}
      </pre>
    </div>
  );
}
