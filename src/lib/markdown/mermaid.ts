import type { Element, ElementContent, RootContent } from "hast";

/** The language of a fenced code block that holds a Mermaid diagram. */
export const MERMAID_LANGUAGE = "mermaid";

/**
 * The element that replaces a Mermaid code block in the Markdown tree.
 *
 * It is a custom element name, so it never collides with the HTML that a
 * document can produce: raw HTML is dropped by `remark-rehype` before the
 * sanitizer ever sees it.
 */
export const MERMAID_TAG = "mermaid-diagram";

export function isElement(node: unknown): node is Element {
  return (
    typeof node === "object" &&
    node !== null &&
    (node as { type?: unknown }).type === "element"
  );
}

function classNames(node: Element): string[] {
  // `className` is an array in hast, but a plain string is accepted as well.
  const className = node.properties?.className as string | string[] | undefined;

  if (Array.isArray(className)) {
    return className.map((name) => String(name));
  }

  if (typeof className === "string") {
    return className.split(/\s+/);
  }

  return [];
}

/**
 * True when the node is a `pre` element that only wraps a Mermaid code block.
 *
 * The language is matched case insensitively, so ```` ```Mermaid ```` and
 * ```` ```mermaid ```` are the same block.
 */
export function isMermaidBlock(node: RootContent | ElementContent): boolean {
  if (!isElement(node) || node.tagName !== "pre") {
    return false;
  }

  const children = node.children ?? [];

  if (children.length !== 1) {
    return false;
  }

  const code = children[0];

  if (!isElement(code) || code.tagName !== "code") {
    return false;
  }

  const wanted = `language-${MERMAID_LANGUAGE}`;

  return classNames(code).some((name) => name.toLowerCase() === wanted);
}

/**
 * Removes the `%%{ ... }%%` directives from a Mermaid source.
 *
 * A directive can rewrite the Mermaid configuration, including the theme and
 * the injected CSS. The app renders untrusted documents, so the directives are
 * dropped before the source reaches the renderer.
 */
export function stripMermaidDirectives(source: string): string {
  return source.replace(/%%\{[^]*?\}%%/g, "").trim();
}
