import { describe, expect, it } from "vitest";
import type { Element, Root } from "hast";

import { renderMarkdownToHtml } from "@/lib/markdown/html";
import { processMarkdown } from "@/lib/markdown/processor";
import { splitIntoSections } from "@/lib/markdown/sections";
import { MERMAID_TAG, stripMermaidDirectives } from "@/lib/markdown/mermaid";

const DIAGRAM = `\`\`\`mermaid
graph TD
  A[Start] --> B{Decision}
  B -->|Yes| C[Render]
\`\`\``;

function findDiagrams(tree: Root): Element[] {
  const found: Element[] = [];

  function walk(node: Root | Element) {
    for (const child of node.children) {
      if (child.type !== "element") {
        continue;
      }

      if (child.tagName === MERMAID_TAG) {
        found.push(child);
        continue;
      }

      walk(child);
    }
  }

  walk(tree);

  return found;
}

/** The blocks of the document, without the whitespace between them. */
function blocks(tree: Root): Element[] {
  return tree.children.filter((child): child is Element => child.type === "element");
}

describe("mermaid code blocks", () => {
  it("become a diagram element instead of a code block", async () => {
    const html = await renderMarkdownToHtml(DIAGRAM);

    expect(html).toContain(`<${MERMAID_TAG}>`);
    expect(html).not.toContain("<pre>");
    expect(html).toContain("graph TD");
    expect(html).toContain("A[Start] --> B{Decision}");
  });

  it("keep the source as plain text", async () => {
    const html = await renderMarkdownToHtml(`\`\`\`mermaid
graph TD
  A["<script>alert(1)</script>"] --> B[Done]
\`\`\``);

    expect(html).not.toContain("<script");
    expect(html).toContain("alert(1)");
  });

  it("do not touch the other code blocks", async () => {
    const html = await renderMarkdownToHtml(`\`\`\`ts
const value = 1;
\`\`\``);

    expect(html).toContain("<pre>");
    expect(html).toContain("language-ts");
    expect(html).not.toContain(MERMAID_TAG);
  });

  it("are matched regardless of the case of the language", async () => {
    const html = await renderMarkdownToHtml(`\`\`\`Mermaid
graph LR
  a --> b
\`\`\``);

    expect(html).toContain(MERMAID_TAG);
  });

  it("are found inside a blockquote and inside a list", async () => {
    const tree = await processMarkdown(`> \`\`\`mermaid
> graph TD
>   a --> b
> \`\`\`

- \`\`\`mermaid
  graph LR
  c --> d
  \`\`\`
`);

    const diagrams = findDiagrams(tree);

    expect(diagrams).toHaveLength(2);
  });

  it("count as a single block, so the sections do not change", async () => {
    const tree = await processMarkdown(`# Title

${DIAGRAM}

After the diagram.`);

    const diagrams = findDiagrams(tree);

    expect(diagrams).toHaveLength(1);
    expect(blocks(tree)).toHaveLength(3);

    const sections = splitIntoSections(tree);

    expect(sections).toHaveLength(1);
    expect(blocks(sections[0].tree)).toHaveLength(3);
  });
});

describe("mermaid directives", () => {
  it("are removed from the diagram source", async () => {
    const html = await renderMarkdownToHtml(`\`\`\`mermaid
%%{init: {"theme": "dark"}}%%
graph TD
  A --> B
\`\`\``);

    expect(html).not.toContain("init");
    expect(html).toContain("graph TD");
  });

  it("leave the rest of the source alone", () => {
    expect(stripMermaidDirectives("%%{init: {}}%%\ngraph TD\n  A --> B")).toBe(
      "graph TD\n  A --> B",
    );
    expect(stripMermaidDirectives("graph TD\n  A --> B")).toBe("graph TD\n  A --> B");
    expect(stripMermaidDirectives("A --> B")).toBe("A --> B");
  });
});
