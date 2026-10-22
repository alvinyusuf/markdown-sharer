"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthFormState } from "@/lib/action-result";
import { LinkButton } from "@/components/ui/link-button";

type SignUpAction = (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;

export function SignupForm({ action, next }: { action: SignUpAction; next: string }) {
  const [state, formAction, pending] = useActionState(action, undefined);

  if (state?.ok) {
    return (
      <div className="space-y-5">
        <Alert className="border-emerald-300/70 bg-emerald-50 text-emerald-950">
          <AlertTitle>Check your inbox</AlertTitle>
          <AlertDescription className="text-emerald-900/90">
            {state.message}
          </AlertDescription>
        </Alert>
        <LinkButton className="h-10 w-full" href="/login">
          Back to sign in
        </LinkButton>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={next} />

      {state && !state.ok ? (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          maxLength={254}
          aria-invalid={Boolean(state && !state.ok && state.fieldErrors?.email)}
        />
        {state && !state.ok && state.fieldErrors?.email ? (
          <p className="text-xs text-destructive">{state.fieldErrors.email[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={72}
          aria-invalid={Boolean(state && !state.ok && state.fieldErrors?.password)}
        />
        {state && !state.ok && state.fieldErrors?.password ? (
          <p className="text-xs text-destructive">{state.fieldErrors.password[0]}</p>
        ) : (
          <p className="text-xs text-muted-foreground">At least 8 characters.</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          aria-invalid={Boolean(state && !state.ok && state.fieldErrors?.confirmPassword)}
        />
        {state && !state.ok && state.fieldErrors?.confirmPassword ? (
          <p className="text-xs text-destructive">
            {state.fieldErrors.confirmPassword[0]}
          </p>
        ) : null}
      </div>

      <Button type="submit" className="h-10 w-full" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={`/login?next=${encodeURIComponent(next)}`}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
