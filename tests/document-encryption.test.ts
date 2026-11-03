import { randomBytes } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import {
  encryptDocumentContent,
  decryptDocumentContent,
} from "@/lib/crypto/document-content";

const context = { id: "a", owner_id: "owner", is_demo: false };
beforeEach(() => {
  vi.stubEnv("DOCUMENT_ENCRYPTION_ACTIVE_KEY_ID", "v1");
  vi.stubEnv("DOCUMENT_ENCRYPTION_KEY_V1", randomBytes(32).toString("base64"));
});
afterEach(() => vi.unstubAllEnvs());

describe("document encryption", () => {
  it.each([
    "ASCII",
    "Bahasa Indonesia 😀 é e\u0301\r\n\n```mermaid\ngraph TD\nA-->B\n```",
    "a".repeat(2097152),
  ])("round trips UTF-8 bytes (%#)", (content) => {
    const stored = encryptDocumentContent(content, context);
    expect(
      Buffer.from(
        decryptDocumentContent(stored.content_encrypted, {
          ...context,
          content_size_bytes: stored.content_size_bytes,
        }),
      ).equals(Buffer.from(content)),
    ).toBe(true);
  });
  it("uses a fresh nonce and conceals markers", () => {
    const a = encryptDocumentContent("unique marker", context),
      b = encryptDocumentContent("unique marker", context);
    expect(a.content_encrypted.iv).not.toBe(b.content_encrypted.iv);
    expect(a.content_encrypted.ciphertext).not.toBe(b.content_encrypted.ciphertext);
    expect(JSON.stringify(a)).not.toContain("unique marker");
  });
  it.each(["iv", "tag", "ciphertext"] as const)("rejects tampered %s", (field) => {
    const stored = encryptDocumentContent("secret", context);
    const bytes = Buffer.from(stored.content_encrypted[field], "base64");
    bytes[0] ^= 1;
    stored.content_encrypted[field] = bytes.toString("base64");
    expect(() =>
      decryptDocumentContent(stored.content_encrypted, {
        ...context,
        content_size_bytes: 6,
      }),
    ).toThrow();
  });
  it("binds immutable context and size", () => {
    const stored = encryptDocumentContent("secret", context);
    for (const change of [
      { id: "b" },
      { owner_id: null },
      { is_demo: true },
      { content_size_bytes: 5 },
    ]) {
      expect(() =>
        decryptDocumentContent(stored.content_encrypted, {
          ...context,
          content_size_bytes: 6,
          ...change,
        }),
      ).toThrow();
    }
  });
  it("rejects wrong or missing keys and unsupported formats", () => {
    const stored = encryptDocumentContent("secret", context);
    const read = (e: unknown) =>
      decryptDocumentContent(e, { ...context, content_size_bytes: 6 });
    for (const e of [
      null,
      "plaintext",
      {},
      { ...stored.content_encrypted, version: 2 },
      { ...stored.content_encrypted, iv: "invalid" },
      { ...stored.content_encrypted, key_id: "constructor" },
    ])
      expect(() => read(e)).toThrow();
    vi.stubEnv("DOCUMENT_ENCRYPTION_KEY_V1", randomBytes(32).toString("base64"));
    expect(() => read(stored.content_encrypted)).toThrow();
    vi.stubEnv("DOCUMENT_ENCRYPTION_KEY_V1", "");
    expect(() => read(stored.content_encrypted)).toThrow();
  });
  it("supports reading old key IDs after rotation", () => {
    const old = encryptDocumentContent("secret", context);
    vi.stubEnv("DOCUMENT_ENCRYPTION_KEY_V2", randomBytes(32).toString("base64"));
    vi.stubEnv("DOCUMENT_ENCRYPTION_ACTIVE_KEY_ID", "v2");
    expect(encryptDocumentContent("secret", context).content_encrypted.key_id).toBe("v2");
    expect(
      decryptDocumentContent(old.content_encrypted, {
        ...context,
        content_size_bytes: 6,
      }),
    ).toBe("secret");
  });
  it("rejects empty, oversized content and invalid configuration", () => {
    for (const content of ["", "a".repeat(2097153)])
      expect(() => encryptDocumentContent(content, context)).toThrow();
    for (const key of ["invalid", Buffer.alloc(31).toString("base64")]) {
      vi.stubEnv("DOCUMENT_ENCRYPTION_KEY_V1", key);
      expect(() => encryptDocumentContent("secret", context)).toThrow();
    }
  });
});
