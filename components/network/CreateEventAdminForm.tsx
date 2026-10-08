"use client";

import { useActionState } from "react";
import { Button } from "@/components/network/ui/Button";
import { Input } from "@/components/network/ui/Input";
import type { ActionState } from "@/lib/network/auth-actions";
import { createEventAdmin } from "@/lib/network/delegation-actions";

export function CreateEventAdminForm() {
  const [state, formAction, pending] = useActionState(createEventAdmin, {} as ActionState);
  return (
    <form action={formAction} className="mt-4 grid gap-3 sm:grid-cols-3">
      <Input name="name" label="Name" required placeholder="Jordan Lee" />
      <Input name="email" type="email" label="Email" required placeholder="events@hitouch.io" />
      <Input name="password" type="password" label="Temporary password" required minLength={8} />
      <div className="sm:col-span-3 flex flex-wrap items-center gap-3">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Adding…" : "Add opportunity admin"}
        </Button>
        {state.error ? <p className="text-sm text-ht-danger">{state.error}</p> : null}
        {state.ok ? <p className="text-sm text-ht-gold">Opportunity admin added.</p> : null}
      </div>
    </form>
  );
}
