import { describe, expect, it } from "vitest";

import { sanitizeNextPath } from "@/lib/auth/redirect";
import { signUpSchema } from "@/lib/validation/schemas";

describe("post-login redirects", () => {
  it("allows same-origin absolute paths", () => {
    expect(sanitizeNextPath("/dashboard")).toBe("/dashboard");
    expect(sanitizeNextPath("/dashboard/documents/abc?tab=edit#top")).toBe(
      "/dashboard/documents/abc?tab=edit#top",
    );
  });

  it("rejects protocol-relative, absolute, and backslash paths", () => {
    expect(sanitizeNextPath("//evil.example")).toBe("/dashboard");
    expect(sanitizeNextPath("https://evil.example")).toBe("/dashboard");
    expect(sanitizeNextPath("/\\evil.example")).toBe("/dashboard");
    expect(sanitizeNextPath("dashboard")).toBe("/dashboard");
    expect(sanitizeNextPath(undefined)).toBe("/dashboard");
    expect(sanitizeNextPath(null, "/")).toBe("/");
  });
});

describe("sign-up validation", () => {
  it("requires matching passwords", () => {
    const result = signUpSchema.safeParse({
      email: "hello@example.com",
      password: "password123",
      confirmPassword: "password124",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.confirmPassword?.[0]).toContain(
        "do not match",
      );
    }
  });

  it("requires at least 8 characters", () => {
    const result = signUpSchema.safeParse({
      email: "hello@example.com",
      password: "short",
      confirmPassword: "short",
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid emails", () => {
    const result = signUpSchema.safeParse({
      email: "not-an-email",
      password: "password123",
      confirmPassword: "password123",
    });

    expect(result.success).toBe(false);
  });
});
