import { randomBytes } from "node:crypto";
import { encryptDocumentContent } from "@/lib/crypto/document-content";
import { afterEach, describe, expect, it, vi } from "vitest";

const { lookup } = vi.hoisted(() => ({ lookup: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));
vi.mock("@/lib/supabase/public", () => ({
  createPublicClient: () => {
    const query = {
      select: () => query,
      eq: () => query,
      maybeSingle: lookup,
    };
    return { from: () => query };
  },
}));

import {
  getPublishedDocument,
  getPublishedDocumentTree,
} from "@/lib/documents/public-queries";
import { getPublishedSections } from "@/lib/documents/public-sections";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});
function fixture(isDemo = true) {
  vi.stubEnv("DOCUMENT_ENCRYPTION_ACTIVE_KEY_ID", "v1");
  vi.stubEnv("DOCUMENT_ENCRYPTION_KEY_V1", randomBytes(32).toString("base64"));
  const context = { id: "demo-id", owner_id: isDemo ? null : "owner", is_demo: isDemo };
  return { ...context, ...encryptDocumentContent("# Demo", context) };
}

describe("temporary guest documents", () => {
  it("blocks the row, rendered document, and presentation at the expiry boundary", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-03T12:00:00Z"));
    // Keep returning the same row, as a cache would after database deletion.
    lookup.mockResolvedValue({
      data: {
        slug: "guest-demo",
        ...fixture(),
        is_demo: true,
        expires_at: "2026-11-04T12:00:00Z",
      },
      error: null,
    });
    expect(await getPublishedDocument("guest-demo")).not.toBeNull();
    expect(await getPublishedDocumentTree("guest-demo")).not.toBeNull();
    expect(await getPublishedSections("guest-demo")).not.toBeNull();
    vi.setSystemTime(new Date("2026-11-04T12:00:00Z"));
    expect(await getPublishedDocument("guest-demo")).toBeNull();
    expect(await getPublishedDocumentTree("guest-demo")).toBeNull();
    expect(await getPublishedSections("guest-demo")).toBeNull();
  });

  it("keeps account documents available without an expiry", async () => {
    lookup.mockResolvedValue({
      data: { ...fixture(false), expires_at: null },
      error: null,
    });
    expect(await getPublishedDocument("saved-document")).not.toBeNull();
  });

  it("strips storage and owner fields from public responses", async () => {
    lookup.mockResolvedValue({
      data: { ...fixture(false), expires_at: null },
      error: null,
    });
    const document = await getPublishedDocument("saved-document");
    expect(document?.content).toBe("# Demo");
    for (const field of ["owner_id", "content_encrypted", "content_size_bytes"])
      expect(document).not.toHaveProperty(field);
  });

  it("keeps service and authentication failures distinct from missing documents", async () => {
    lookup.mockResolvedValue({
      data: null,
      error: { message: "sensitive database details" },
    });
    await expect(getPublishedDocument("saved-document")).rejects.toThrow(
      "Could not load this document.",
    );
    const row = { ...fixture(false), expires_at: null };
    row.content_encrypted.tag = Buffer.alloc(16).toString("base64");
    lookup.mockResolvedValue({ data: row, error: null });
    await expect(getPublishedDocument("saved-document")).rejects.toThrow(
      "Document encryption service unavailable.",
    );
  });

  it("stops viewer and sections reads after deletion or unpublish", async () => {
    lookup.mockResolvedValue({
      data: { ...fixture(false), expires_at: null },
      error: null,
    });
    expect(await getPublishedDocumentTree("saved-document")).not.toBeNull();
    expect(await getPublishedSections("saved-document")).not.toBeNull();
    lookup.mockResolvedValue({ data: null, error: null });
    expect(await getPublishedDocument("saved-document")).toBeNull();
    expect(await getPublishedDocumentTree("saved-document")).toBeNull();
    expect(await getPublishedSections("saved-document")).toBeNull();
  });
});
