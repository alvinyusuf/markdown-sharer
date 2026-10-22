import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { DocumentList } from "@/components/documents/document-list";
import { SetupNotice } from "@/components/system/setup-notice";
import { Skeleton } from "@/components/ui/skeleton";
import { hasSupabaseEnv } from "@/config/env";
import { getCurrentUser } from "@/lib/auth/session";
import { listOwnDocuments } from "@/lib/documents/queries";
import { LinkButton } from "@/components/ui/link-button";

export const metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-3">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>
      <Skeleton className="h-14 w-full rounded-2xl" />
      <Skeleton className="h-72 w-full rounded-2xl" />
    </div>
  );
}

async function DashboardContent() {
  await connection();

  if (!hasSupabaseEnv()) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect Supabase to start managing documents.
          </p>
        </div>
        <SetupNotice />
      </div>
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const documents = await listOwnDocuments(user.id);

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            Workspace
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            Your documents
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {documents.length === 0
              ? "Upload a Markdown file to get started."
              : `${documents.length} ${documents.length === 1 ? "document" : "documents"} · drafts stay private`}
          </p>
        </div>
        <LinkButton className="self-start sm:self-auto" href="/dashboard/new">
          <span className="text-base leading-none">+</span>
          New document
        </LinkButton>
      </div>

      <DocumentList documents={documents} />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
