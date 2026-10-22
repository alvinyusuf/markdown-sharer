import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";

import { DocumentContentForm } from "@/components/documents/document-content-form";
import { SetupNotice } from "@/components/system/setup-notice";
import { hasSupabaseEnv } from "@/config/env";
import { getCurrentUser } from "@/lib/auth/session";
import { getOwnDocument } from "@/lib/documents/queries";
import { documentIdSchema } from "@/lib/validation/schemas";
import { formatDateTime } from "@/lib/utils/date";

export const metadata: Metadata = {
  title: "Edit Markdown",
  robots: { index: false, follow: false },
};

export default async function EditDocumentPage({
  params,
}: PageProps<"/dashboard/documents/[id]/edit">) {
  await connection();

  if (!hasSupabaseEnv()) {
    return <SetupNotice />;
  }

  const user = await getCurrentUser();
  const { id } = await params;

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/dashboard/documents/${id}/edit`)}`);
  }

  const parsedId = documentIdSchema.safeParse(id);
  if (!parsedId.success) {
    notFound();
  }

  const document = await getOwnDocument(user.id, parsedId.data);
  if (!document) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href={`/dashboard/documents/${document.id}`}
        className="inline-flex items-center gap-1.5 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
      >
        <ArrowLeft className="size-3.5" />
        Back to preview
      </Link>

      <div>
        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          Edit Markdown
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight">
          {document.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated {formatDateTime(document.updated_at)}. Save to re-render the
          preview.
        </p>
      </div>

      <DocumentContentForm documentId={document.id} initialContent={document.content} />
    </div>
  );
}

export const instant = false;
