"use client";

import { Check, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { copyTextToClipboard } from "@/lib/utils/clipboard";

type ShareButtonProps = {
  url: string;
  title: string;
  label?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm";
  className?: string;
  iconOnly?: boolean;
};

export function ShareButton({
  url,
  title,
  label = "Share",
  variant = "outline",
  size = "default",
  className,
  iconOnly = false,
}: ShareButtonProps) {
  const [shared, setShared] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  async function onShare() {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
        setShared(true);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => setShared(false), 2000);
        return;
      } catch (error) {
        // The reader dismissed the share sheet. Nothing to do.
        if ((error as Error | undefined)?.name === "AbortError") {
          return;
        }
      }
    }

    // No share sheet available: copying the link is the closest fallback.
    const success = await copyTextToClipboard(url);

    if (!success) {
      toast.error("We couldn't share this document. Copy the link from the address bar.");
      return;
    }

    toast.success("Link copied to your clipboard.");
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={() => void onShare()}
      aria-label={iconOnly ? "Share" : undefined}
    >
      {shared ? <Check className="size-4" /> : <Share2 className="size-4" />}
      {iconOnly ? null : <span>{shared ? "Shared" : label}</span>}
    </Button>
  );
}
