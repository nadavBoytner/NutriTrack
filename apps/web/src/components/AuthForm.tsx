"use client";

import { useActionState } from "react";
import { Button } from "@/components/Button";
import { Field, Input } from "@/components/Field";
import type { AuthActionState } from "@/app/actions/auth";

export function AuthForm({
  action,
  submitLabel,
}: {
  action: (state: AuthActionState, formData: FormData) => Promise<AuthActionState>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-5">
      <Field label="אימייל" htmlFor="email">
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </Field>
      <Field label="סיסמה" htmlFor="password">
        <Input id="password" name="password" type="password" required minLength={8} autoComplete="current-password" />
      </Field>
      {state?.error && <p className="text-sm text-warn">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "רגע..." : submitLabel}
      </Button>
    </form>
  );
}
