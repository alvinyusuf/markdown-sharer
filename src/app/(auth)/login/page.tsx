import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { AuthCard, AuthPageShell } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { SetupNotice } from "@/components/system/setup-notice";
import { hasSupabaseEnv } from "@/config/env";
import { signInAction } from "@/lib/auth/actions";
import { sanitizeNextPath } from "@/lib/auth/redirect";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to upload and manage your Markdown documents.",
  robots: { index: false, follow: false },
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  await connection();

  const params = await searchParams;
  const next = sanitizeNextPath(first(params.next));
  const error = first(params.error);

  const user = await getCurrentUser();
  if (user) {
    redirect(next);
  }

  return (
    <AuthPageShell>
      <AuthCard
        title="Welcome back"
        description="Sign in to upload Markdown and keep your drafts in one place."
        footer={
          <span>Your documents stay private until you choose to publish them.</span>
        }
      >
        {hasSupabaseEnv() ? (
          <LoginForm action={signInAction} next={next} initialError={error} />
        ) : (
          <SetupNotice />
        )}
      </AuthCard>
    </AuthPageShell>
  );
}

export const instant = false;
