"use client";

import { useActionState } from "react";
import { Button } from "@/components/network/ui/Button";
import { inviteVendor } from "@/lib/network/jobs";
import { cn } from "@/lib/network/utils";

interface EventOption {
  id: string;
  title: string;
}

export function InviteVendorForm({
  freelancerId,
  jobId,
  events,
  className,
}: {
  freelancerId: string;
  jobId?: string;
  events?: EventOption[];
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(inviteVendor, {});

  if (state.ok) {
    return <p className={cn("ht-label text-ht-gold", className)}>Invite sent</p>;
  }

  return (
    <form action={formAction} className={cn("space-y-2", className)}>
      <input type="hidden" name="freelancerId" value={freelancerId} />
      {jobId ? (
        <input type="hidden" name="jobId" value={jobId} />
      ) : (
        <select
          name="jobId"
          required
          defaultValue=""
          aria-label="Opportunity to invite this vendor to"
          className="w-full border-2 border-ht-line bg-ht-panel px-2 py-1.5 text-sm text-ht-cream focus:border-ht-gold focus:outline-none"
        >
          <option value="" disabled>
            Choose an opportunity…
          </option>
          {events?.map((e) => (
            <option key={e.id} value={e.id}>
              {e.title}
            </option>
          ))}
        </select>
      )}
      <Button type="submit" size="sm" variant="outline" disabled={pending} className="w-full">
        {pending ? "Inviting…" : jobId ? "Invite" : "Invite to apply"}
      </Button>
      {state.error ? <p className="text-xs text-ht-danger">{state.error}</p> : null}
    </form>
  );
}
