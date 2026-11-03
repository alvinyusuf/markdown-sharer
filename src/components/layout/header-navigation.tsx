"use client";

import { Menu, X } from "lucide-react";
import { useId, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HeaderNavigation({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div
      className="ml-auto md:contents"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setOpen(false);
          event.currentTarget.querySelector<HTMLButtonElement>("button")?.focus();
        }
      }}
    >
      <Button
        type="button"
        variant="outline"
        className="h-11 gap-2 px-3 md:hidden"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="size-4" /> : <Menu className="size-4" />}
        Menu
      </Button>
      <div
        id={panelId}
        className={cn(
          "absolute inset-x-4 top-full mt-2 max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-xl border bg-background p-4 shadow-lg md:static md:mt-0 md:flex md:max-h-none md:flex-1 md:items-center md:justify-between md:overflow-visible md:rounded-none md:border-0 md:bg-transparent md:p-0 md:shadow-none",
          open ? "grid gap-4" : "hidden",
        )}
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("a")) setOpen(false);
        }}
        onSubmit={() => setOpen(false)}
      >
        {children}
      </div>
    </div>
  );
}
