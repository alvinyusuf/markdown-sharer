import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { activeDocumentKey, documentKey, DocumentCryptoError } from "./document-keys";

export type ContentEnvelope = {
  version: 1;
  key_id: string;
  iv: string;
  tag: string;
  ciphertext: string;
};
export type DocumentContentContext = {
  id: string;
  owner_id: string | null;
  is_demo: boolean;
  content_size_bytes: number;
};

function aad(context: DocumentContentContext, keyId: string) {
  if (
    !Number.isInteger(context.content_size_bytes) ||
    context.content_size_bytes < 1 ||
    context.content_size_bytes > 2097152
  )
    throw new DocumentCryptoError("INVALID_CONTENT");
  return Buffer.from(
    JSON.stringify([
      "readmeo:document-content",
      1,
      keyId,
      context.id,
      context.owner_id,
      context.is_demo,
      context.content_size_bytes,
    ]),
    "utf8",
  );
}

function decode(value: unknown, length: number): Buffer {
  if (
    typeof value !== "string" ||
    value.length !== 4 * Math.ceil(length / 3) ||
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)
  )
    throw new DocumentCryptoError("INVALID_ENVELOPE");
  const bytes = Buffer.from(value, "base64");
  if (bytes.length !== length || bytes.toString("base64") !== value)
    throw new DocumentCryptoError("INVALID_ENVELOPE");
  return bytes;
}

export function encryptDocumentContent(
  content: string,
  context: Omit<DocumentContentContext, "content_size_bytes">,
) {
  const bytes = Buffer.from(content, "utf8");
  const content_size_bytes = bytes.length;
  const { id, key } = activeDocumentKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv, { authTagLength: 16 });
  cipher.setAAD(aad({ ...context, content_size_bytes }, id));
  const ciphertext = Buffer.concat([cipher.update(bytes), cipher.final()]);
  const content_encrypted: ContentEnvelope = {
    version: 1,
    key_id: id,
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
    ciphertext: ciphertext.toString("base64"),
  };
  return { content_encrypted, content_size_bytes };
}

export function decryptDocumentContent(
  envelope: unknown,
  context: DocumentContentContext,
): string {
  if (!envelope || typeof envelope !== "object" || Array.isArray(envelope))
    throw new DocumentCryptoError("INVALID_ENVELOPE");
  const e = envelope as ContentEnvelope;
  if (e.version !== 1 || typeof e.key_id !== "string" || !/^v[1-9][0-9]*$/.test(e.key_id))
    throw new DocumentCryptoError("INVALID_ENVELOPE");
  const additionalData = aad(context, e.key_id);
  const iv = decode(e.iv, 12),
    tag = decode(e.tag, 16),
    ciphertext = decode(e.ciphertext, context.content_size_bytes);
  const key = documentKey(e.key_id);
  try {
    const decipher = createDecipheriv("aes-256-gcm", key, iv, { authTagLength: 16 });
    decipher.setAAD(additionalData);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString(
      "utf8",
    );
  } catch {
    throw new DocumentCryptoError("AUTHENTICATION");
  }
}
