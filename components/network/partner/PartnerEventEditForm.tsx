"use client";

import { useActionState } from "react";
import { Button } from "@/components/network/ui/Button";
import { Input } from "@/components/network/ui/Input";
import { Select } from "@/components/network/ui/Select";
import { Textarea } from "@/components/network/ui/Textarea";
import { updatePartnerEvent } from "@/lib/network/partner-event-actions";

export function PartnerEventEditForm({
  eventId,
  name,
  description,
  location,
  applicationCloseAtLocal,
  outreachAudience,
}: {
  eventId: string;
  name: string;
  description: string | null;
  location: string | null;
  applicationCloseAtLocal: string;
  outreachAudience: "ALL_VENDORS" | "INVITED_ONLY";
}) {
  const [state, formAction, pending] = useActionState(updatePartnerEvent, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="eventId" value={eventId} />
      <Input label="Event name" name="name" required defaultValue={name} />
      <Textarea
        label="Description"
        name="description"
        rows={3}
        defaultValue={description ?? ""}
      />
      <Input label="Location" name="location" defaultValue={location ?? ""} />
      <Input
        label="Application close"
        name="applicationCloseAt"
        type="datetime-local"
        defaultValue={applicationCloseAtLocal}
      />
      <Select
        name="outreachAudience"
        label="Vendor outreach audience"
        defaultValue={outreachAudience}
      >
        <option value="INVITED_ONLY">Recommended / invited only</option>
        <option value="ALL_VENDORS">All matching vendors</option>
      </Select>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving…" : "Save event details"}
      </Button>
      {state.error ? <p className="text-sm text-ht-danger">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-ht-gold">{state.detail}</p> : null}
    </form>
  );
}
