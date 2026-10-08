"use client";

import { useActionState } from "react";
import { Button } from "@/components/network/ui/Button";
import { Input } from "@/components/network/ui/Input";
import { signIn } from "@/lib/network/auth-actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, {});

  return (
    <form action={formAction} className="space-y-4">
      <Input label="Email" name="email" type="email" required autoComplete="email" />
      <Input
        label="Password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
      />
      {state.error ? (
        <p className="border-2 border-ht-danger/60 px-3 py-2 text-sm text-ht-danger">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
