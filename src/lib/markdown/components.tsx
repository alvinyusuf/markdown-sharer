import type { ComponentProps } from "react";

import { CodeBlock } from "@/components/markdown/code-block";

function heading(level: 1 | 2 | 3 | 4 | 5 | 6) {
  const Tag = `h${level}` as const;

  return function Heading({ id, children, ...props }: ComponentProps<typeof Tag>) {
    return (
      <Tag id={id} className="group scroll-mt-24" {...props}>
        {children}
        {id ? (
          <a href={`#${id}`} className="heading-anchor" aria-label="Link to this section">
            #
          </a>
        ) : null}
      </Tag>
    );
  };
}

/**
 * The element map used to turn a sanitized Markdown tree into React.
 *
 * It lives in its own module so the same map can be used on the server (the
 * normal document view) and in the browser (presentation mode) without
 * pulling the Markdown pipeline into the client bundle.
 */
export const markdownComponents = {
  h1: heading(1),
  h2: heading(2),
  h3: heading(3),
  h4: heading(4),
  h5: heading(5),
  h6: heading(6),
  pre: CodeBlock,
  table: ({ children, ...props }: ComponentProps<"table">) => (
    <div className="table-wrap">
      <table {...props}>{children}</table>
    </div>
  ),
  a: ({ href, children, ...props }: ComponentProps<"a">) => {
    const isExternal = typeof href === "string" && /^https?:\/\//i.test(href);

    return (
      <a
        href={href}
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer nofollow" } : {})}
        {...props}
      >
        {children}
      </a>
    );
  },
  img: ({ alt, ...props }: ComponentProps<"img">) => (
    // Markdown images can point anywhere; next/image requires a configured
    // allowlist of remote hosts. We never fetch them on the server.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      alt={alt ?? ""}
      loading="lazy"
      decoding="async"
      className="h-auto max-w-full rounded-lg border"
    />
  ),
};
