const MAX_SLUG_BASE_LENGTH = 80;
const RANDOM_SUFFIX_BYTES = 4;

/**
 * Turns a title into a URL-safe prefix. We deliberately do not rely on the
 * title alone for uniqueness.
 */
export function slugifyTitle(title: string): string {
  const normalized = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG_BASE_LENGTH)
    .replace(/-+$/g, "");

  return normalized || "document";
}

export function randomSlugSuffix(): string {
  const bytes = new Uint8Array(RANDOM_SUFFIX_BYTES);
  crypto.getRandomValues(bytes);

  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function generateSlug(title: string, suffix = randomSlugSuffix()): string {
  return `${slugifyTitle(title)}-${suffix}`;
}

export function isValidSlug(slug: string): boolean {
  return (
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length >= 3 && slug.length <= 120
  );
}
