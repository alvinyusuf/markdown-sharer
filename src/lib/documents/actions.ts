"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { ActionResult } from "@/lib/action-result";
import { getCurrentUser } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateSlug, isValidSlug } from "@/lib/slug/slug";
import { createClient } from "@/lib/supabase/server";
import type { CreateDocumentInput } from "@/lib/validation/schemas";
import {
  createDocumentInputSchema,
  updateDocumentContentSchema,
  updateDocumentMetadataSchema,
} from "@/lib/validation/schemas";
import { MAX_DOCUMENTS_PER_USER } from "@/lib/validation/document";

const SLUG_ATTEMPTS = 5;

function fieldErrors(error: {
  flatten: () => { fieldErrors: Record<string, string[] | undefined> };
}) {
  return error.flatten().fieldErrors;
}

function isSlugConflict(code: string | undefined): boolean {
  return code === "23505";
}

function mapDatabaseError(message: string): string {
  if (message.includes("Document limit")) {
    return `You can keep at most ${MAX_DOCUMENTS_PER_USER} documents. Delete one before uploading another.`;
  }

  if (message.includes("duplicate key")) {
    return "We couldn't reserve a public address for this document. Try again.";
  }

  return "We couldn't save this document. Try again in a moment.";
}

export async function createDraftAction(
  input: CreateDocumentInput,
): Promise<ActionResult> {
  const user = await getCurrentUser();

  if (!user) {
    return { ok: false, message: "Sign in to upload a document." };
  }

  const parsed = createDocumentInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the document details and try again.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  const limit = checkRateLimit(`create-draft:${user.id}`, {
    limit: 10,
    windowMs: 10 * 60 * 1000,
  });

  if (!limit.ok) {
    return {
      ok: false,
      message: "You're uploading too quickly. Wait a few minutes and try again.",
    };
  }

  const supabase = await createClient();

  const { count, error: countError } = await supabase
    .from("documents")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", user.id);

  if (countError) {
    return { ok: false, message: "We couldn't check your document limit. Try again." };
  }

  if ((count ?? 0) >= MAX_DOCUMENTS_PER_USER) {
    return {
      ok: false,
      message: `You can keep at most ${MAX_DOCUMENTS_PER_USER} documents. Delete one before uploading another.`,
    };
  }

  const baseSlug = generateSlug(parsed.data.title);
  let lastError: { message: string; code?: string } | null = null;

  for (let attempt = 0; attempt < SLUG_ATTEMPTS; attempt += 1) {
    const slug = attempt === 0 ? baseSlug : generateSlug(parsed.data.title);
    if (!isValidSlug(slug)) {
      continue;
    }

    const { data, error } = await supabase
      .from("documents")
      .insert({
        owner_id: user.id,
        title: parsed.data.title,
        description: parsed.data.description || null,
        content: parsed.data.content,
        slug,
        status: "draft",
        published_at: null,
      })
      .select("id, slug")
      .single();

    if (!error && data) {
      revalidatePath("/dashboard");
      redirect(`/dashboard/documents/${data.id}`);
    }

    lastError = { message: error?.message ?? "Unknown insert error", code: error?.code };

    if (!isSlugConflict(error?.code)) {
      break;
    }
  }

  return {
    ok: false,
    message: mapDatabaseError(lastError?.message ?? ""),
  };
}

export async function updateDocumentMetadataAction(input: {
  documentId: string;
  title: string;
  description: string;
}): Promise<ActionResult> {
  const user = await getCurrentUser();

  if (!user) {
    return { ok: false, message: "Your session expired. Sign in again." };
  }

  const parsed = updateDocumentMetadataSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the fields below.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .update({
      title: parsed.data.title,
      description: parsed.data.description || null,
    })
    .eq("id", parsed.data.documentId)
    .eq("owner_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return { ok: false, message: mapDatabaseError(error.message) };
  }

  if (!data) {
    return { ok: false, message: "Document not found." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/documents/${parsed.data.documentId}`);

  return { ok: true, message: "Document details saved." };
}

export async function updateDocumentContentAction(input: {
  documentId: string;
  content: string;
}): Promise<ActionResult> {
  const user = await getCurrentUser();

  if (!user) {
    return { ok: false, message: "Your session expired. Sign in again." };
  }

  const parsed = updateDocumentContentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the document content and try again.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .update({ content: parsed.data.content })
    .eq("id", parsed.data.documentId)
    .eq("owner_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return { ok: false, message: mapDatabaseError(error.message) };
  }

  if (!data) {
    return { ok: false, message: "Document not found." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/documents/${parsed.data.documentId}`);

  return { ok: true, message: "Content saved." };
}
