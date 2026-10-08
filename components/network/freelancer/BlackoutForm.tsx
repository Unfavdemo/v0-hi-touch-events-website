"use client";

import { useActionState } from "react";
import { Button } from "@/components/network/ui/Button";
import { Input } from "@/components/network/ui/Input";
import { createBlackout } from "@/lib/network/vendor-blackout-actions";

export function BlackoutForm() {
  const [state, formAction, pending] = useActionState(createBlackout, {});

  return (
    <form action={formAction} className="max-w-md space-y-4 border-2 border-ht-line bg-ht-panel p-5">
      <h2 className="text-lg font-semibold text-ht-cream">Block time off</h2>
      <p className="text-sm text-ht-muted">
        Off-platform gigs, travel, or time off. You won&apos;t be matched to overlapping opportunities.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Start" name="startAt" type="date" required />
        <Input label="End" name="endAt" type="date" required />
      </div>
      <Input label="Label (optional)" name="label" placeholder="Vacation, wedding, etc." />
      {state.error ? <p className="text-sm text-ht-danger">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-ht-gold">Blocked dates saved.</p> : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving…" : "Add blackout"}
      </Button>
    </form>
  );
}
