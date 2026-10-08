"use client";

import { useActionState } from "react";
import { Button } from "@/components/network/ui/Button";
import { Input } from "@/components/network/ui/Input";
import { createCrewMember } from "@/lib/network/vendor-crew-actions";

export function CrewMemberForm() {
  const [state, formAction, pending] = useActionState(createCrewMember, {});

  return (
    <form action={formAction} className="max-w-md space-y-4 border-2 border-ht-line bg-ht-panel p-5">
      <h2 className="text-lg font-semibold text-ht-cream">Add crew member</h2>
      <Input label="Name" name="name" required />
      <Input label="Role on site" name="role" required placeholder="Service captain, A2, etc." />
      <Input label="Phone (optional)" name="phone" type="tel" />
      {state.error ? <p className="text-sm text-ht-danger">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-ht-gold">Crew member saved.</p> : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving…" : "Add to roster"}
      </Button>
    </form>
  );
}
