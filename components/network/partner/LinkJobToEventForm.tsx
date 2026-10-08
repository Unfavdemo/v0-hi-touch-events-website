"use client";

import { useActionState } from "react";
import { Button } from "@/components/network/ui/Button";
import { Select } from "@/components/network/ui/Select";
import { linkJobToPartnerEvent } from "@/lib/network/partner-event-actions";

export function LinkJobToEventForm({
  eventId,
  unlinkedJobs,
}: {
  eventId: string;
  unlinkedJobs: { id: string; title: string }[];
}) {
  const [state, formAction, pending] = useActionState(linkJobToPartnerEvent, {});

  if (unlinkedJobs.length === 0) {
    return (
      <p className="text-sm text-ht-muted">
        Every opportunity you&apos;ve posted is already linked to an event, or you haven&apos;t
        posted any yet.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="eventId" value={eventId} />
      <div className="min-w-[240px] flex-1">
        <Select name="jobId" label="Link existing opportunity" required defaultValue="">
          <option value="" disabled>
            Select…
          </option>
          {unlinkedJobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title}
            </option>
          ))}
        </Select>
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Linking…" : "Link"}
      </Button>
      {state.error ? (
        <p className="w-full text-sm text-ht-danger">{state.error}</p>
      ) : null}
      {state.ok ? (
        <p className="w-full text-sm text-ht-gold">{state.detail}</p>
      ) : null}
    </form>
  );
}
