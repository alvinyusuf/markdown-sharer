import "server-only";

export class DocumentCryptoError extends Error {
  constructor(
    public readonly code:
      "CONFIGURATION" | "INVALID_CONTENT" | "INVALID_ENVELOPE" | "AUTHENTICATION",
  ) {
    super("Document encryption service unavailable.");
  }
}

const variables: Record<string, string> = {
  v1: "DOCUMENT_ENCRYPTION_KEY_V1",
  v2: "DOCUMENT_ENCRYPTION_KEY_V2",
};

export function documentKey(id: string): Buffer {
  const value = Object.hasOwn(variables, id) ? process.env[variables[id]] : undefined;
  if (!value || !/^[A-Za-z0-9+/]{43}=$/.test(value))
    throw new DocumentCryptoError("CONFIGURATION");
  const key = Buffer.from(value, "base64");
  if (key.length !== 32 || key.toString("base64") !== value)
    throw new DocumentCryptoError("CONFIGURATION");
  return key;
}

export function activeDocumentKey() {
  const id = process.env.DOCUMENT_ENCRYPTION_ACTIVE_KEY_ID;
  if (!id) throw new DocumentCryptoError("CONFIGURATION");
  return { id, key: documentKey(id) };
}
