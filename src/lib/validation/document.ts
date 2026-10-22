export const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;
export const MAX_CONTENT_BYTES = MAX_FILE_SIZE_BYTES;
export const MAX_TITLE_LENGTH = 200;
export const MAX_DESCRIPTION_LENGTH = 500;
export const MAX_DOCUMENTS_PER_USER = 100;
export const MAX_FILE_NAME_LENGTH = 255;

export const SUPPORTED_EXTENSIONS = [".md", ".markdown"] as const;

export type FileValidationResult = { ok: true } | { ok: false; message: string };

export type DecodeResult = { ok: true; content: string } | { ok: false; message: string };

export function utf8ByteLength(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileExtension(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot === -1 ? "" : fileName.slice(dot).toLowerCase();
}

export function validateMarkdownFile(file: {
  name: string;
  size: number;
}): FileValidationResult {
  const extension = getFileExtension(file.name);

  if (
    !SUPPORTED_EXTENSIONS.includes(extension as (typeof SUPPORTED_EXTENSIONS)[number])
  ) {
    return {
      ok: false,
      message: "Choose a .md or .markdown file.",
    };
  }

  if (file.size === 0) {
    return {
      ok: false,
      message: "This file is empty.",
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      ok: false,
      message: `This file is ${formatBytes(file.size)}. The maximum size is 2 MB.`,
    };
  }

  return { ok: true };
}

/**
 * Decodes bytes as strict UTF-8. Browsers often mislabel files, so we ignore
 * the MIME type and validate the bytes themselves.
 */
export function decodeMarkdown(buffer: ArrayBuffer): DecodeResult {
  let text: string;

  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    return {
      ok: false,
      message: "We couldn't read this file as UTF-8. Save it as UTF-8 and try again.",
    };
  }

  const content = text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");

  if (content.includes("\u0000")) {
    return {
      ok: false,
      message: "This file contains characters we can't store. Save it as UTF-8 text.",
    };
  }

  if (!content.trim()) {
    return {
      ok: false,
      message: "This file is empty.",
    };
  }

  if (utf8ByteLength(content) > MAX_CONTENT_BYTES) {
    return {
      ok: false,
      message: "This file is larger than 2 MB.",
    };
  }

  return { ok: true, content };
}

export function titleFromFileName(fileName: string): string {
  const withoutExtension = fileName.replace(/\.(md|markdown)$/i, "");
  const title = withoutExtension.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();

  return (title || "Untitled document").slice(0, MAX_TITLE_LENGTH);
}
