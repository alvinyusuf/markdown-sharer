import type { Element, Root, RootContent } from "hast";
import type { Plugin } from "unified";

import {
  MERMAID_TAG,
  isMermaidBlock,
  stripMermaidDirectives,
} from "@/lib/markdown/mermaid";
import { textOf } from "@/lib/markdown/sections";

type Parent = {
  children: RootContent[];
};

function createDiagramElement(source: string): RootContent {
  return {
    type: "element",
    tagName: MERMAID_TAG,
    properties: {},
    children: source ? [{ type: "text", value: source }] : [],
  };
}

function transform(parent: Parent): void {
  const children: RootContent[] = [];

  for (const child of parent.children) {
    if (isMermaidBlock(child)) {
      children.push(createDiagramElement(stripMermaidDirectives(textOf(child))));
      continue;
    }

    if (child.type === "element") {
      transform(child as Element);
    }

    children.push(child);
  }

  parent.children = children;
}

/**
 * Turns Mermaid code blocks into diagram elements.
 *
 * The plugin runs after the sanitizer, in the same trusted stage as the
 * heading anchors and the syntax highlighting, and before the highlighter, so
 * a Mermaid block is never sent to highlight.js.
 *
 * The source of the diagram is kept as plain text. It is never parsed as
 * HTML, which keeps the guarantee of the sanitizer intact: the diagram is
 * drawn later by Mermaid itself, in the browser, from this text.
 */
export const rehypeMermaid: Plugin<[], Root> = () => {
  return (tree) => {
    transform(tree);
  };
};
