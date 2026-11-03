import type { Metadata } from "next";
import { UploadDropzone } from "@/components/documents/upload-dropzone";
import { SetupNotice } from "@/components/system/setup-notice";
import { LinkButton } from "@/components/ui/link-button";
import { hasSupabaseEnv } from "@/config/env";

export const metadata: Metadata = {
  title: "Try Markdown without signing in",
  robots: { index: false, follow: false },
};

export default function TryPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-3xl font-semibold tracking-tight">
        Try Readmeo without an account
      </h1>
      <p className="mt-3 mb-8 text-sm leading-relaxed text-muted-foreground">
        Upload a Markdown file to preview, share, and present it. Your document is public
        to anyone with its link and is automatically deleted after 24 hours.
      </p>
      {hasSupabaseEnv() ? <UploadDropzone demo /> : <SetupNotice />}
      <div className="mt-8 border-t pt-6 text-sm text-muted-foreground">
        Want to keep and edit your documents?
        <LinkButton href="/signup" variant="link">
          Create an account
        </LinkButton>
      </div>
    </div>
  );
}
