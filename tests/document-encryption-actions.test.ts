import { randomBytes } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const { insert, update, single, maybeSingle, query } = vi.hoisted(() => {
  const insert = vi.fn(),
    update = vi.fn(),
    single = vi.fn(),
    maybeSingle = vi.fn();
  const query: Record<string, ReturnType<typeof vi.fn>> = {};
  return { insert, update, single, maybeSingle, query };
});
const owner = "11111111-1111-4111-8111-111111111111";
const documentId = "22222222-2222-4222-8222-222222222222";
vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), updateTag: vi.fn() }));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("next/navigation", () => ({
  redirect: () => {
    throw new Error("REDIRECT");
  },
}));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: async () => ({ id: owner }) }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: () => ({ ok: true }) }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ from: () => query }),
}));
vi.mock("@/lib/supabase/public", () => ({
  createPublicClient: () => ({ from: () => query }),
}));

import {
  createDraftAction,
  createDemoDocumentAction,
  updateDocumentContentAction,
} from "@/lib/documents/actions";
import { decryptDocumentContent } from "@/lib/crypto/document-content";

beforeEach(() => {
  vi.stubEnv("DOCUMENT_ENCRYPTION_ACTIVE_KEY_ID", "v1");
  vi.stubEnv("DOCUMENT_ENCRYPTION_KEY_V1", randomBytes(32).toString("base64"));
  insert.mockReset().mockReturnValue(query);
  update.mockReset().mockReturnValue(query);
  single
    .mockReset()
    .mockResolvedValue({ data: { id: documentId, slug: "test-document" }, error: null });
  maybeSingle
    .mockReset()
    .mockResolvedValue({ data: { id: documentId, slug: "test-document" }, error: null });
  Object.assign(query, {
    insert,
    update,
    single,
    maybeSingle,
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    then: vi.fn((resolve) => resolve({ count: 0, error: null })),
  });
});
afterEach(() => vi.unstubAllEnvs());
const input = {
  title: "Encrypted document",
  description: "",
  content: "# unique secret 😀",
};

describe("encrypted document writes", () => {
  it.each([false, true])("encrypts create before storage (guest=%s)", async (guest) => {
    await expect(
      (guest ? createDemoDocumentAction : createDraftAction)(input),
    ).rejects.toThrow("REDIRECT");
    const row = insert.mock.calls[0][0];
    expect(row).not.toHaveProperty("content");
    expect(JSON.stringify(row)).not.toContain(input.content);
    expect(
      decryptDocumentContent(row.content_encrypted, {
        id: row.id,
        owner_id: guest ? null : owner,
        is_demo: guest,
        content_size_bytes: row.content_size_bytes,
      }),
    ).toBe(input.content);
  });
  it("checks ownership context before atomically updating encrypted content", async () => {
    maybeSingle.mockResolvedValueOnce({
      data: { id: documentId, owner_id: owner, is_demo: false },
      error: null,
    });
    expect(
      (await updateDocumentContentAction({ documentId, content: input.content })).ok,
    ).toBe(true);
    const row = update.mock.calls[0][0];
    expect(row).not.toHaveProperty("content");
    expect(
      decryptDocumentContent(row.content_encrypted, {
        id: documentId,
        owner_id: owner,
        is_demo: false,
        content_size_bytes: row.content_size_bytes,
      }),
    ).toBe(input.content);
    expect(query.eq).toHaveBeenCalledWith("owner_id", owner);
  });
  it("does not write when configuration is missing", async () => {
    vi.stubEnv("DOCUMENT_ENCRYPTION_KEY_V1", "");
    expect((await createDraftAction(input)).ok).toBe(false);
    expect((await createDemoDocumentAction(input)).ok).toBe(false);
    maybeSingle.mockResolvedValueOnce({
      data: { id: documentId, owner_id: owner, is_demo: false },
      error: null,
    });
    expect(
      (await updateDocumentContentAction({ documentId, content: input.content })).ok,
    ).toBe(false);
    expect(insert).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });
  it("does not encrypt or write for missing ownership", async () => {
    maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    expect(
      (await updateDocumentContentAction({ documentId, content: input.content })).ok,
    ).toBe(false);
    expect(update).not.toHaveBeenCalled();
  });
});
