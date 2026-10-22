const DEFAULT_FALLBACK = "/dashboard";

/**
 * Only allow same-origin absolute paths. `//evil.example` and paths with
 * backslashes are rejected to prevent open redirects after login.
 */
export function sanitizeNextPath(
  next: string | null | undefined,
  fallback = DEFAULT_FALLBACK,
): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return fallback;
  }

  try {
    const url = new URL(next, "http://internal.local");
    if (url.origin !== "http://internal.local") {
      return fallback;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
