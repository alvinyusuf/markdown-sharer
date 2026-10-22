import { describe, expect, it } from "vitest";
import type { Element, ElementContent, Root, RootContent } from "hast";

import {
  FALLBACK_MAX_BLOCKS,
  FALLBACK_SECTION_CHARS,
  splitIntoSections,
  textOf,
} from "@/lib/markdown/sections";

function text(value: string): ElementContent {
  return { type: "text", value };
}

function paragraph(value: string): Element {
  return { type: "element", tagName: "p", properties: {}, children: [text(value)] };
}

function heading(level: 1 | 2 | 3, value: string): Element {
  return {
    type: "element",
    tagName: `h${level}`,
    properties: {},
    children: [text(value)],
  };
}

function root(children: RootContent[]): Root {
  return { type: "root", children };
}

function allChildren(tree: Root): RootContent[] {
  return tree.children ?? [];
}

describe("text of a node", () => {
  it("collects nested text", () => {
    const node: Element = {
      type: "element",
      tagName: "p",
      properties: {},
      children: [
        text("Hello "),
        { type: "element", tagName: "strong", properties: {}, children: [text("world")] },
      ],
    };

    expect(textOf(node)).toBe("Hello world");
  });
});

describe("splitting on headings", () => {
  it("cuts at every h1 and h2", () => {
    const sections = splitIntoSections(
      root([
        heading(1, "Title"),
        paragraph("Intro"),
        heading(2, "First"),
        paragraph("Body"),
        heading(3, "Ignored"),
        paragraph("Still body"),
        heading(2, "Second"),
        paragraph("End"),
      ]),
    );

    expect(sections).toHaveLength(3);
    expect(sections.map((section) => section.title)).toEqual([
      "Title",
      "First",
      "Second",
    ]);
  });

  it("ignores h3 and deeper headings", () => {
    const sections = splitIntoSections(
      root([heading(1, "Title"), heading(3, "Sub"), paragraph("Body")]),
    );

    expect(sections).toHaveLength(1);
    expect(sections[0].title).toBe("Title");
  });

  it("keeps the content before the first heading as its own section", () => {
    const sections = splitIntoSections(
      root([paragraph("Preamble"), heading(1, "Title"), paragraph("Body")]),
    );

    expect(sections).toHaveLength(2);
    expect(sections[0].title).toBeNull();
    expect(sections[1].title).toBe("Title");
  });

  it("gives every section a unique id", () => {
    const sections = splitIntoSections(
      root([heading(1, "A"), paragraph("x"), heading(2, "B"), paragraph("y")]),
    );

    expect(sections.map((section) => section.id)).toEqual(["section-1", "section-2"]);
  });
});

describe("the fallback rule", () => {
  it("is used only when there is no h1 or h2", () => {
    const withHeadings = splitIntoSections(
      root([heading(2, "A"), paragraph("a"), paragraph("b"), paragraph("c")]),
    );

    expect(withHeadings).toHaveLength(1);

    const withoutHeadings = splitIntoSections(
      root([paragraph("a"), paragraph("b"), paragraph("c")]),
    );

    expect(withoutHeadings).toHaveLength(1);
  });

  it("starts a new section after the character budget", () => {
    const long = "x".repeat(FALLBACK_SECTION_CHARS);
    const sections = splitIntoSections(
      root([paragraph(long), paragraph("second"), paragraph("third")]),
    );

    expect(sections.length).toBeGreaterThan(1);
    expect(sections[0].title).toBeNull();
  });

  it("never puts more than the block limit in one section", () => {
    const blocks = Array.from({ length: FALLBACK_MAX_BLOCKS + 3 }, () =>
      paragraph("short"),
    );
    const sections = splitIntoSections(root(blocks));

    expect(sections).toHaveLength(2);
    expect(allChildren(sections[0].tree)).toHaveLength(FALLBACK_MAX_BLOCKS);
    expect(allChildren(sections[1].tree)).toHaveLength(3);
  });

  it("keeps a single oversized block on its own", () => {
    const huge = "y".repeat(FALLBACK_SECTION_CHARS * 3);
    const sections = splitIntoSections(root([paragraph(huge), paragraph("after")]));

    expect(sections).toHaveLength(2);
    expect(allChildren(sections[0].tree)).toHaveLength(1);
  });
});

describe("the content never changes", () => {
  const document = root([
    paragraph("Preamble"),
    heading(1, "Title"),
    paragraph("Body one"),
    heading(2, "Section"),
    paragraph("Body two"),
    {
      type: "element",
      tagName: "ul",
      properties: {},
      children: [
        {
          type: "element",
          tagName: "li",
          properties: {},
          children: [text("item")],
        },
      ],
    },
  ]);

  it("reproduces the original blocks in order", () => {
    const sections = splitIntoSections(document);
    const flattened = sections.flatMap((section) => allChildren(section.tree));

    expect(flattened).toEqual(allChildren(document));
  });

  it("also holds for the fallback rule", () => {
    const blocks = Array.from({ length: 20 }, (_, index) =>
      paragraph(`paragraph ${index}`),
    );
    const fallbackDocument = root(blocks);
    const sections = splitIntoSections(fallbackDocument);
    const flattened = sections.flatMap((section) => allChildren(section.tree));

    expect(flattened).toEqual(allChildren(fallbackDocument));
  });
});

describe("degenerate documents", () => {
  it("returns no sections for an empty document", () => {
    expect(splitIntoSections(root([]))).toEqual([]);
  });

  it("returns one section for a single block", () => {
    const sections = splitIntoSections(root([paragraph("only")]));

    expect(sections).toHaveLength(1);
    expect(sections[0].title).toBeNull();
  });

  it("handles a heading without any text", () => {
    const sections = splitIntoSections(root([heading(1, ""), paragraph("body")]));

    expect(sections).toHaveLength(1);
    expect(sections[0].title).toBeNull();
  });
});
