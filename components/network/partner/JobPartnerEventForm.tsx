"use client";

import { useActionState } from "react";
import { Button } from "@/components/network/ui/Button";
import { Select } from "@/components/network/ui/Select";
import { setJobPartnerEventFromJobPage } from "@/lib/network/partner-event-actions";

export function JobPartnerEventForm({
  jobId,
  currentEventId,
  events,
}: {
  jobId: string;
  currentEventId: string | null;
  events: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(setJobPartnerEventFromJobPage, {});

  return (
    <form action={formAction} className="space-y-3 border-2 border-ht-line bg-ht-panel p-4">
      <p className="ht-label text-ht-muted">Event</p>
      <p className="text-xs text-ht-muted">
        Group this role with other opportunities under one show or client event.
      </p>
      <input type="hidden" name="jobId" value={jobId} />
      <Select
        name="partnerEventId"
        label="Linked event"
        defaultValue={currentEventId ?? ""}
      >
        <option value="">— Not part of an event —</option>
        {events.map((ev) => (
          <option key={ev.id} value={ev.id}>
            {ev.name}
          </option>
        ))}
      </Select>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving…" : "Update event link"}
      </Button>
      {state.error ? <p className="text-sm text-ht-danger">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-ht-gold">{state.detail}</p> : null}
    </form>
  );
}
