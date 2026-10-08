"use client";

import { useActionState } from "react";
import { Button } from "@/components/network/ui/Button";
import { Select } from "@/components/network/ui/Select";
import { Textarea } from "@/components/network/ui/Textarea";
import { createIncident } from "@/lib/network/incident-actions";

export function IncidentForm({
  vendors,
  jobs,
}: {
  vendors: { id: string; name: string }[];
  jobs: { id: string; title: string }[];
}) {
  const [state, formAction, pending] = useActionState(createIncident, {});
  return (
    <form action={formAction} className="space-y-4">
      <Select name="vendorId" label="Vendor" required defaultValue="">
        <option value="" disabled>
          Pick a vendor
        </option>
        {vendors.map((v) => (
          <option key={v.id} value={v.id}>
            {v.name}
          </option>
        ))}
      </Select>
      <Select name="jobId" label="Opportunity (optional)" defaultValue="">
        <option value="">Not tied to an opportunity</option>
        {jobs.map((j) => (
          <option key={j.id} value={j.id}>
            {j.title}
          </option>
        ))}
      </Select>
      <Select name="kind" label="Kind" required defaultValue="COMPLAINT">
        <option value="NO_SHOW">No-show</option>
        <option value="COMPLAINT">Complaint</option>
        <option value="DAMAGE">Damage</option>
        <option value="OTHER">Other</option>
      </Select>
      <Textarea name="notes" label="Notes" required minLength={3} />
      <label className="flex items-center gap-2 text-sm text-ht-cream">
        <input type="checkbox" name="flagForDismissal" className="accent-ht-gold" />
        Flag this vendor for dismissal
      </label>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving…" : "Log incident"}
      </Button>
      {state.error ? <p className="text-sm text-ht-danger">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-ht-gold">Incident logged.</p> : null}
    </form>
  );
}
