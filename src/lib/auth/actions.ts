"use server";

import { redirect } from "next/navigation";

import { getSiteUrl, hasSupabaseEnv } from "@/config/env";
import type { AuthFormState } from "@/lib/action-result";
import { sanitizeNextPath } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";
import { signInSchema, signUpSchema } from "@/lib/validation/schemas";

function flatten(error: {
  flatten: () => { fieldErrors: Record<string, string[] | undefined> };
}) {
  return error.flatten().fieldErrors;
}

function mapSignInError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "Incorrect email or password.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Confirm your email address before signing in.";
  }

  if (normalized.includes("rate limit") || normalized.includes("too many")) {
    return "Too many attempts. Wait a moment and try again.";
  }

  return "We couldn't sign you in. Check your details and try again.";
}

export async function signInAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      message:
        "Supabase is not configured. Add your project URL and anon key to .env.local.",
    };
  }

  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the fields below.",
      fieldErrors: flatten(parsed.error),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { ok: false, message: mapSignInError(error.message) };
  }

  redirect(sanitizeNextPath(formData.get("next")?.toString()));
}

export async function signUpAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      message:
        "Supabase is not configured. Add your project URL and anon key to .env.local.",
    };
  }

  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the fields below.",
      fieldErrors: flatten(parsed.error),
    };
  }

  const supabase = await createClient();
  const next = sanitizeNextPath(formData.get("next")?.toString());
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    const normalized = error.message.toLowerCase();

    if (normalized.includes("already registered")) {
      return {
        ok: false,
        message: "An account with this email already exists. Try signing in instead.",
      };
    }

    if (normalized.includes("rate limit") || normalized.includes("too many")) {
      return {
        ok: false,
        message: "Too many attempts. Wait a moment and try again.",
      };
    }

    return {
      ok: false,
      message: "We couldn't create your account. Check your details and try again.",
    };
  }

  if (!data.session) {
    return {
      ok: true,
      message:
        "Check your inbox to confirm your email address. You can close this tab once you've confirmed.",
    };
  }

  redirect(next);
}

export async function signOutAction() {
  try {
    if (hasSupabaseEnv()) {
      const supabase = await createClient();
      try {
        await supabase.auth.signOut();
      } catch {
        // Fall back to clearing the local session if the auth server is
        // temporarily unreachable.
        await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
      }
    }
  } catch {
    // The redirect below still returns the visitor to a public page.
  }

  redirect("/");
}
