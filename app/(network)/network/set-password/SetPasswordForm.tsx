"use client";

import { useActionState } from "react";
import { Button } from "@/components/network/ui/Button";
import { Input } from "@/components/network/ui/Input";
import { setPasswordFromToken } from "@/lib/network/password-reset-actions";

export function SetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(setPasswordFromToken, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <Input
        label="New password"
        name="newPassword"
        type="password"
        required
        minLength={8}
        autoComplete="new-password"
        hint="At least 8 characters"
      />
      <Input
        label="Confirm password"
        name="confirmPassword"
        type="password"
        required
        minLength={8}
        autoComplete="new-password"
      />
      {state.error ? (
        <p className="border-2 border-ht-danger/60 px-3 py-2 text-sm text-ht-danger">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Saving…" : "Save password & sign in"}
      </Button>
    </form>
  );
}
