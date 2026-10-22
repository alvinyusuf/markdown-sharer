import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import type { ReactNode } from "react";
import type { Root } from "hast";

import { markdownComponents } from "@/lib/markdown/components";
import { processMarkdown } from "@/lib/markdown/processor";

export function renderTree(tree: Root): ReactNode {
  return toJsxRuntime(tree, {
    Fragment,
    jsx,
    jsxs,
    components: markdownComponents,
  });
}

export async function renderMarkdown(markdown: string): Promise<ReactNode> {
  const tree = await processMarkdown(markdown);

  return renderTree(tree);
}
