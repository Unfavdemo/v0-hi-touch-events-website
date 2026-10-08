"use client";

import { Button } from "@/components/network/ui/Button";
import { delegateEvent } from "@/lib/network/delegation-actions";

export function DelegateEventForm({
  jobId,
  admins,
}: {
  jobId: string;
  admins: { id: string; name: string }[];
}) {
  if (admins.length === 0) {
    return (
      <p className="mt-3 text-sm text-ht-muted">
        Add opportunity admins on Team, then assign them here.
      </p>
    );
  }
  return (
    <form action={delegateEvent} className="mt-3 flex flex-wrap items-end gap-2">
      <input type="hidden" name="jobId" value={jobId} />
      <label className="space-y-1.5">
        <span className="ht-label block text-ht-muted">Assign</span>
        <select
          name="adminId"
          required
          className="border-2 border-ht-line bg-ht-panel px-3 py-2 text-sm text-ht-cream focus:border-ht-gold focus:outline-none"
        >
          {admins.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </label>
      <Button type="submit" size="sm" variant="outline">
        Assign
      </Button>
    </form>
  );
}
