"use client";

import { useActionState } from "react";
import { Button } from "@/components/network/ui/Button";
import { Input } from "@/components/network/ui/Input";
import type { ActionState } from "@/lib/network/auth-actions";
import { addPartnerCoordinator } from "@/lib/network/team-actions";

export function AddCoordinatorForm() {
  const [state, formAction, pending] = useActionState(addPartnerCoordinator, {} as ActionState);
  return (
    <form action={formAction} className="mt-4 grid gap-3 sm:grid-cols-3">
      <Input id="coordinator-name" name="name" label="Name" required placeholder="Alex Chen" />
      <Input id="coordinator-email" name="email" type="email" label="Email" required placeholder="ops@company.com" />
      <Input id="coordinator-password" name="password" type="password" label="Temporary password" required minLength={8} />
      <div className="sm:col-span-3 flex flex-wrap items-center gap-3">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Adding…" : "Add coordinator"}
        </Button>
        {state.error ? <p className="text-sm text-ht-danger">{state.error}</p> : null}
        {state.ok ? <p className="text-sm text-ht-gold">Coordinator added. Share that login with them.</p> : null}
      </div>
    </form>
  );
}
