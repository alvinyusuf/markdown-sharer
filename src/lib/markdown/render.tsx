import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import type { ComponentProps, ReactNode } from "react";
import type { Root } from "hast";

import { CodeBlock } from "@/components/markdown/code-block";
import { processMarkdown } from "@/lib/markdown/processor";

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

const components = {
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

export function renderTree(tree: Root): ReactNode {
  return toJsxRuntime(tree, {
    Fragment,
    jsx,
    jsxs,
    components,
  });
}

export async function renderMarkdown(markdown: string): Promise<ReactNode> {
  const tree = await processMarkdown(markdown);

  return renderTree(tree);
}
