import { toHtml } from "hast-util-to-html";

import { processMarkdown } from "@/lib/markdown/processor";

/**
 * String output used by unit tests and for inspecting the sanitized tree.
 * The app itself renders React elements instead of HTML strings.
 */
export async function renderMarkdownToHtml(markdown: string): Promise<string> {
  const tree = await processMarkdown(markdown);
  return toHtml(tree);
}
