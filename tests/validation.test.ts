import { describe, expect, it } from "vitest";

import {
  MAX_FILE_SIZE_BYTES,
  decodeMarkdown,
  formatBytes,
  getFileExtension,
  titleFromFileName,
  utf8ByteLength,
  validateMarkdownFile,
} from "@/lib/validation/document";

function bufferOf(text: string): ArrayBuffer {
  return new TextEncoder().encode(text).buffer as ArrayBuffer;
}

describe("markdown file validation", () => {
  it("accepts .md and .markdown case-insensitively", () => {
    expect(validateMarkdownFile({ name: "notes.md", size: 10 })).toEqual({ ok: true });
    expect(validateMarkdownFile({ name: "notes.MARKDOWN", size: 10 })).toEqual({
      ok: true,
    });
  });

  it("rejects unsupported extensions", () => {
    const result = validateMarkdownFile({ name: "notes.txt", size: 10 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain(".md");
    }
  });

  it("rejects empty files", () => {
    const result = validateMarkdownFile({ name: "notes.md", size: 0 });
    expect(result).toEqual({ ok: false, message: "This file is empty." });
  });

  it("enforces the 2 MB limit", () => {
    expect(validateMarkdownFile({ name: "ok.md", size: MAX_FILE_SIZE_BYTES }).ok).toBe(
      true,
    );

    const tooLarge = validateMarkdownFile({
      name: "big.md",
      size: MAX_FILE_SIZE_BYTES + 1,
    });
    expect(tooLarge.ok).toBe(false);
    if (!tooLarge.ok) {
      expect(tooLarge.message).toContain("2 MB");
    }
  });

  it("extracts extensions safely", () => {
    expect(getFileExtension("notes.md")).toBe(".md");
    expect(getFileExtension("archive.notes.MD")).toBe(".md");
    expect(getFileExtension("no-extension")).toBe("");
    expect(getFileExtension(".md")).toBe(".md");
  });
});

describe("UTF-8 decoding", () => {
  it("decodes valid UTF-8 and strips a BOM", () => {
    const result = decodeMarkdown(bufferOf("\uFEFF# Hello\n\nWorld"));
    expect(result).toEqual({ ok: true, content: "# Hello\n\nWorld" });
  });

  it("normalizes CRLF and CR line endings", () => {
    const result = decodeMarkdown(bufferOf("a\r\nb\rc"));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.content).toBe("a\nb\nc");
    }
  });

  it("rejects invalid UTF-8 bytes", () => {
    const invalid = new Uint8Array([0xff, 0xfe, 0xfd]).buffer;
    const result = decodeMarkdown(invalid);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain("UTF-8");
    }
  });

  it("rejects whitespace-only documents", () => {
    const result = decodeMarkdown(bufferOf("   \n\n\t"));
    expect(result).toEqual({ ok: false, message: "This file is empty." });
  });

  it("rejects content whose UTF-8 size exceeds 2 MB", () => {
    const result = decodeMarkdown(bufferOf("é".repeat(MAX_FILE_SIZE_BYTES / 2 + 1)));
    expect(result.ok).toBe(false);
  });

  it("counts bytes, not characters", () => {
    expect(utf8ByteLength("abc")).toBe(3);
    expect(utf8ByteLength("é")).toBe(2);
    expect(utf8ByteLength("🙂")).toBe(4);
  });
});

describe("title suggestions", () => {
  it("turns a file name into a readable title", () => {
    expect(titleFromFileName("product-launch_notes.md")).toBe("product launch notes");
    expect(titleFromFileName("Meeting Notes.MARKDOWN")).toBe("Meeting Notes");
  });

  it("falls back for empty names", () => {
    expect(titleFromFileName(".md")).toBe("Untitled document");
  });

  it("formats byte sizes", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(2048)).toBe("2.0 KB");
    expect(formatBytes(2 * 1024 * 1024)).toBe("2.0 MB");
  });
});
