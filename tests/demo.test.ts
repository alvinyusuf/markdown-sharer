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

afterEach(() => vi.useRealTimers());

describe("temporary guest documents", () => {
  it("blocks the row, rendered document, and presentation at the expiry boundary", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-03T12:00:00Z"));
    // Keep returning the same row, as a cache would after database deletion.
    lookup.mockResolvedValue({
      data: {
        slug: "guest-demo",
        content: "# Demo",
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
    lookup.mockResolvedValue({ data: { expires_at: null, is_demo: false }, error: null });
    expect(await getPublishedDocument("saved-document")).not.toBeNull();
  });
});
