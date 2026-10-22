import Link from "next/link";
import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";

type LinkButtonProps = Omit<ComponentProps<typeof Button>, "render"> & {
  href: string;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
};

/**
 * A `Button` that renders a Next.js `Link` instead of a native `<button>`.
 *
 * Base UI's `Button` assumes it renders a real `<button>` (`nativeButton`
 * defaults to `true`). Rendering an anchor through the `render` prop keeps the
 * button styling but drops native button semantics, so we opt out explicitly
 * to stay accessible and avoid a development warning.
 */
export function LinkButton({
  href,
  children,
  prefetch,
  replace,
  scroll,
  ...props
}: LinkButtonProps) {
  return (
    <Button
      {...props}
      nativeButton={false}
      render={<Link href={href} prefetch={prefetch} replace={replace} scroll={scroll} />}
    >
      {children}
    </Button>
  );
}
