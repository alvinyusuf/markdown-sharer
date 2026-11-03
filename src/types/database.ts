export type DocumentStatus = "draft" | "published";

export type DocumentRow = {
  id: string;
  owner_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  content: string;
  status: DocumentStatus;
  is_demo: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export type StoredDocumentRow = Omit<DocumentRow, "content"> & {
  content_encrypted: import("@/lib/crypto/document-content").ContentEnvelope;
  content_size_bytes: number;
};
export type DocumentInsert = Pick<
  StoredDocumentRow,
  "id" | "title" | "slug" | "content_encrypted" | "content_size_bytes"
> &
  Partial<
    Omit<
      StoredDocumentRow,
      "id" | "title" | "slug" | "content_encrypted" | "content_size_bytes"
    >
  >;
export type DocumentUpdate = Partial<
  Omit<StoredDocumentRow, "id" | "owner_id" | "is_demo">
>;

export type Database = {
  public: {
    Tables: {
      documents: {
        Row: StoredDocumentRow;
        Insert: DocumentInsert;
        Update: DocumentUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type DocumentSummary = Pick<
  DocumentRow,
  | "id"
  | "title"
  | "slug"
  | "description"
  | "status"
  | "created_at"
  | "updated_at"
  | "published_at"
>;

/**
 * The subset of a document that the public viewer is allowed to see.
 * `owner_id` is intentionally missing so it can never reach an anonymous
 * response.
 */
export type PublicDocument = Pick<
  DocumentRow,
  | "id"
  | "title"
  | "slug"
  | "description"
  | "content"
  | "is_demo"
  | "expires_at"
  | "created_at"
  | "updated_at"
  | "published_at"
>;
