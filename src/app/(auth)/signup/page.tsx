import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { AuthCard, AuthPageShell } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";
import { SetupNotice } from "@/components/system/setup-notice";
import { hasSupabaseEnv } from "@/config/env";
import { signUpAction } from "@/lib/auth/actions";
import { sanitizeNextPath } from "@/lib/auth/redirect";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a MarkdownShare account and publish your first document.",
  robots: { index: false, follow: false },
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  await connection();

  const params = await searchParams;
  const next = sanitizeNextPath(first(params.next));

  const user = await getCurrentUser();
  if (user) {
    redirect(next);
  }

  return (
    <AuthPageShell>
      <AuthCard
        title="Create your account"
        description="Upload Markdown, preview the result, and share a clean link when you're ready."
        footer={
          <span>
            Prefer to look around first?{" "}
            <Link href="/" className="font-medium text-foreground hover:underline">
              Back to home
            </Link>
          </span>
        }
      >
        {hasSupabaseEnv() ? (
          <SignupForm action={signUpAction} next={next} />
        ) : (
          <SetupNotice />
        )}
      </AuthCard>
    </AuthPageShell>
  );
}

export const instant = false;
