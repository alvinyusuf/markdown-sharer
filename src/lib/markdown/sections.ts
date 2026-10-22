import type { Element, Root, RootContent } from "hast";

/**
 * A document is presented one section at a time.
 *
 * Sections are derived from the sanitized Markdown tree, never from the
 * Markdown source, so the presentation shows exactly the same content as the
 * normal view. Concatenating every section reproduces the original tree.
 */
export type DocumentSection = {
  id: string;
  title: string | null;
  tree: Root;
};

/** Fallback rule: start a new section after this much text. */
export const FALLBACK_SECTION_CHARS = 1500;

/** Fallback rule: never put more than this many blocks in one section. */
export const FALLBACK_MAX_BLOCKS = 12;

function isElement(node: RootContent): node is Element {
  return node.type === "element";
}

function isHeading(node: RootContent): node is Element {
  return isElement(node) && (node.tagName === "h1" || node.tagName === "h2");
}

function collectText(node: unknown, out: string[]): void {
  if (!node || typeof node !== "object") {
    return;
  }

  const current = node as { type?: string; value?: string; children?: unknown[] };

  if (current.type === "text" && typeof current.value === "string") {
    out.push(current.value);
    return;
  }

  if (Array.isArray(current.children)) {
    for (const child of current.children) {
      collectText(child, out);
    }
  }
}

/** The plain text of a node, used for section titles and the fallback size. */
export function textOf(node: unknown): string {
  const parts: string[] = [];
  collectText(node, parts);
  return parts.join("");
}

function toSection(group: RootContent[], index: number): DocumentSection {
  const heading = group.find(isHeading) ?? null;

  return {
    id: `section-${index + 1}`,
    title: heading ? textOf(heading).trim() || null : null,
    tree: { type: "root", children: group },
  };
}

/**
 * Splits a document into presentation sections.
 *
 * The primary rule cuts at every H1 and H2 heading, which is what the spec
 * asks for. Content before the first heading becomes its own untitled
 * section. When a document has no H1 or H2 at all, the fallback rule cuts
 * after roughly 1500 characters of text or 12 top level blocks, whichever
 * comes first.
 */
export function splitIntoSections(tree: Root): DocumentSection[] {
  const children = tree.children ?? [];

  if (children.length === 0) {
    return [];
  }

  if (children.some(isHeading)) {
    const groups: RootContent[][] = [];
    let current: RootContent[] = [];

    for (const child of children) {
      if (isHeading(child)) {
        if (current.length > 0) {
          groups.push(current);
        }
        current = [child];
      } else {
        current.push(child);
      }
    }

    if (current.length > 0) {
      groups.push(current);
    }

    return groups.map(toSection);
  }

  const groups: RootContent[][] = [];
  let current: RootContent[] = [];
  let characters = 0;

  for (const child of children) {
    const size = textOf(child).length;

    if (
      current.length > 0 &&
      (characters + size > FALLBACK_SECTION_CHARS ||
        current.length >= FALLBACK_MAX_BLOCKS)
    ) {
      groups.push(current);
      current = [];
      characters = 0;
    }

    current.push(child);
    characters += size;
  }

  if (current.length > 0) {
    groups.push(current);
  }

  return groups.map(toSection);
}
