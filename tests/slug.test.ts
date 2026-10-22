import { describe, expect, it } from "vitest";

import { generateSlug, isValidSlug, slugifyTitle } from "@/lib/slug/slug";

describe("slug generation", () => {
  it("builds a readable prefix plus a random suffix", () => {
    const slug = generateSlug("Hello, World!", "deadbeef");
    expect(slug).toBe("hello-world-deadbeef");
    expect(isValidSlug(slug)).toBe(true);
  });

  it("strips accents and punctuation", () => {
    expect(slugifyTitle("Café déjà vu: notes & more!")).toBe("cafe-deja-vu-notes-more");
  });

  it("falls back for titles with no URL-safe characters", () => {
    expect(slugifyTitle("???")).toBe("document");
    expect(generateSlug("???", "12345678")).toBe("document-12345678");
  });

  it("caps the title portion so slugs stay URL friendly", () => {
    const slug = slugifyTitle("a".repeat(200));
    expect(slug.length).toBeLessThanOrEqual(80);
    expect(isValidSlug(`${slug}-12345678`)).toBe(true);
  });

  it("always generates lowercase hex suffixes", () => {
    const slug = generateSlug("Doc");
    expect(slug).toMatch(/^doc-[a-f0-9]{8}$/);
  });

  it("validates slug shape", () => {
    expect(isValidSlug("my-doc-12345678")).toBe(true);
    expect(isValidSlug("My-Doc")).toBe(false);
    expect(isValidSlug("-leading")).toBe(false);
    expect(isValidSlug("double--dash")).toBe(false);
    expect(isValidSlug("trailing-")).toBe(false);
    expect(isValidSlug("ab")).toBe(false);
  });
});
