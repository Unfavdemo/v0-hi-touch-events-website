"use client";

import { useActionState } from "react";
import { Button } from "@/components/network/ui/Button";
import { Input } from "@/components/network/ui/Input";
import { Select } from "@/components/network/ui/Select";
import { Textarea } from "@/components/network/ui/Textarea";
import { createPartnerEvent } from "@/lib/network/partner-event-actions";

export function PartnerEventCreateForm() {
  const [state, formAction, pending] = useActionState(createPartnerEvent, {});

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <Input
        label="Event name"
        name="name"
        required
        placeholder="Annual gala — March 2026"
      />
      <Textarea
        label="Description (optional)"
        name="description"
        rows={4}
        placeholder="Overall scope, guest count, theme, notes for your team…"
      />
      <Input
        label="Location (optional)"
        name="location"
        placeholder="Philadelphia, PA — Convention center"
      />
      <Input
        label="Application close"
        name="applicationCloseAt"
        type="datetime-local"
        required
      />
      <Select name="outreachAudience" label="Notify vendors" defaultValue="INVITED_ONLY">
        <option value="INVITED_ONLY">Recommended / invited only</option>
        <option value="ALL_VENDORS">All matching vendors (by skill)</option>
      </Select>
      <label className="flex items-center gap-3 border-2 border-ht-line bg-ht-panel px-4 py-3 text-sm text-ht-cream">
        <input
          type="checkbox"
          name="sendInitialOutreach"
          defaultChecked
          className="h-4 w-4 accent-ht-gold"
        />
        Send the first outreach notice when opportunities go live (or now if roles are
        already active)
      </label>
      <p className="text-sm text-ht-muted">
        Vendors get automatic reminders 2 weeks and 1 week before application close (if they
        haven&apos;t applied yet). After you hire on each role, HiTouch admins can send full
        event details to hired vendors.
      </p>
      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create event"}
      </Button>
      {state.error ? <p className="text-sm text-ht-danger">{state.error}</p> : null}
    </form>
  );
}
