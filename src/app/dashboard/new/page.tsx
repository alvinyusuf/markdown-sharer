import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";

import { UploadDropzone } from "@/components/documents/upload-dropzone";
import { SetupNotice } from "@/components/system/setup-notice";
import { hasSupabaseEnv } from "@/config/env";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Upload Markdown",
  robots: { index: false, follow: false },
};

export default async function NewDocumentPage() {
  await connection();

  if (!hasSupabaseEnv()) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">
          Upload Markdown
        </h1>
        <SetupNotice />
      </div>
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/dashboard/new");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
      >
        <ArrowLeft className="size-3.5" />
        Back to dashboard
      </Link>

      <div className="mt-5 mb-8">
        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          New document
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          Upload a Markdown file
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          We&apos;ll read it as UTF-8, check the size, and show you exactly how it will
          render before anything is published.
        </p>
      </div>

      <UploadDropzone />
    </div>
  );
}

export const instant = false;
