import rehypeExternalLinks from "rehype-external-links";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import type { Root } from "hast";

import { MAX_CONTENT_BYTES, utf8ByteLength } from "@/lib/validation/document";

/**
 * One pipeline shared by the public viewer, the dashboard preview, and the
 * tests. Raw HTML is never parsed (remark-rehype drops it), and the resulting
 * tree is sanitized again as defence in depth before any highlighting or
 * generated anchor attributes are added.
 */
function createProcessor() {
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeSanitize, defaultSchema)
    .use(rehypeSlug)
    .use(rehypeExternalLinks, {
      target: "_blank",
      rel: ["nofollow", "noopener", "noreferrer"],
      protocols: ["http", "https", "mailto"],
    })
    .use(rehypeHighlight, {
      detect: false,
      plainText: ["txt", "text", "plain", "plaintext"],
    });
}

let processor: ReturnType<typeof createProcessor> | undefined;

function getProcessor() {
  processor ??= createProcessor();
  return processor;
}

export async function processMarkdown(markdown: string): Promise<Root> {
  if (utf8ByteLength(markdown) > MAX_CONTENT_BYTES) {
    throw new Error("Document is too large to render.");
  }

  const parser = getProcessor();
  const tree = parser.parse(markdown);
  return (await parser.run(tree)) as Root;
}
