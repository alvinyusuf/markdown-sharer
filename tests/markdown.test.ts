import { describe, expect, it } from "vitest";

import { renderMarkdownToHtml } from "@/lib/markdown/html";

describe("markdown rendering", () => {
  it("renders GitHub Flavored Markdown features", async () => {
    const html = await renderMarkdownToHtml(`
# Title

~~struck~~ and **bold**

- [x] done
- [ ] todo

| A | B |
| - | - |
| 1 | 2 |

> quoted

\`\`\`ts
const value: number = 1;
\`\`\`
`);

    expect(html).toContain("<h1");
    expect(html).toContain("struck");
    expect(html).toContain("<del>");
    expect(html).toContain("task-list-item");
    expect(html).toContain('type="checkbox"');
    expect(html).toContain("<table>");
    expect(html).toContain("<blockquote>");
    expect(html).toContain("hljs-keyword");
  });

  it("adds stable heading ids and does not duplicate them", async () => {
    const html = await renderMarkdownToHtml(`
# Same heading

## Same heading
`);

    expect(html).toContain('id="same-heading"');
    expect(html).toContain('id="same-heading-1"');
  });

  it("drops raw HTML entirely", async () => {
    const html = await renderMarkdownToHtml(`
# Safe

<script>alert("xss")</script>

<img src="x" onerror="alert(1)" />

<iframe src="https://evil.example"></iframe>

<svg onload="alert(1)"><circle /></svg>
`);

    expect(html).not.toContain("<script");
    expect(html).not.toContain("<iframe");
    expect(html).not.toContain("<svg");
    expect(html).not.toContain("onerror");
    expect(html).not.toContain("onload");
    expect(html).not.toContain("alert(");
  });

  it("removes dangerous link protocols", async () => {
    const html = await renderMarkdownToHtml(`
[click](javascript:alert(1))
[data](data:text/html;base64,PHNjcmlwdD4=)
[file](file:///etc/passwd)
`);

    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("data:text/html");
    expect(html).not.toContain("file://");
  });

  it("removes dangerous image sources", async () => {
    const html = await renderMarkdownToHtml(`
![bad](javascript:alert(1))
![data](data:image/svg+xml;base64,PHN2Zz4=)
`);

    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("data:image");
  });

  it("only opens external links in a new tab", async () => {
    const html = await renderMarkdownToHtml(`
[external](https://example.com/docs)
[internal](/dashboard)
[email](mailto:hello@example.com)
`);

    expect(html).toContain('href="https://example.com/docs"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="nofollow noopener noreferrer"');
    expect(html).toContain('href="/dashboard"');
    expect(html).toMatch(/<a href="\/dashboard">internal<\/a>/);
    expect(html).toContain('href="mailto:hello@example.com"');
  });

  it("keeps image alt text and source but never fetches it", async () => {
    const html = await renderMarkdownToHtml(
      "![A system diagram](https://example.com/diagram.png)",
    );

    expect(html).toContain('alt="A system diagram"');
    expect(html).toContain('src="https://example.com/diagram.png"');
  });

  it("survives malformed Markdown without throwing", async () => {
    const html = await renderMarkdownToHtml(
      "# Open code fence\n\n```ts\nconst x = 1;\n\n| broken | table\n[[[",
    );

    expect(html).toContain("<h1");
  });

  it("rejects documents above the render limit", async () => {
    const oversized = "a".repeat(2 * 1024 * 1024 + 1);
    await expect(renderMarkdownToHtml(oversized)).rejects.toThrow(/too large/i);
  });
});
