"use client";

import { Check, Link2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { copyTextToClipboard } from "@/lib/utils/clipboard";

type CopyLinkButtonProps = {
  url: string;
  label?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm";
  className?: string;
  iconOnly?: boolean;
};

export function CopyLinkButton({
  url,
  label = "Copy link",
  variant = "outline",
  size = "default",
  className,
  iconOnly = false,
}: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  async function onCopy() {
    const success = await copyTextToClipboard(url);

    if (!success) {
      toast.error("We couldn't copy the link. Copy it from the address bar instead.");
      return;
    }

    setCopied(true);
    toast.success("Link copied to your clipboard.");

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={() => void onCopy()}
      aria-label={iconOnly ? "Copy link" : undefined}
    >
      {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
      {iconOnly ? null : <span>{copied ? "Copied" : label}</span>}
    </Button>
  );
}
