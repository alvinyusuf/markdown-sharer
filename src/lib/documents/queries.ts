import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { DocumentRow, DocumentSummary } from "@/types/database";

const SUMMARY_COLUMNS =
  "id, title, slug, description, status, created_at, updated_at, published_at";

export async function listOwnDocuments(userId: string): Promise<DocumentSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .select(SUMMARY_COLUMNS)
    .eq("owner_id", userId)
    .order("updated_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error("Could not load your documents.");
  }

  return data ?? [];
}

export async function getOwnDocument(
  userId: string,
  documentId: string,
): Promise<DocumentRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .eq("owner_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error("Could not load this document.");
  }

  return data;
}

export async function countOwnDocuments(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("documents")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", userId);

  if (error) {
    return 0;
  }

  return count ?? 0;
}
