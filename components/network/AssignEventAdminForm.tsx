"use client";

import { Button } from "@/components/network/ui/Button";
import { delegateEvent } from "@/lib/network/delegation-actions";

export function AssignEventAdminForm({
  jobId,
  admins,
}: {
  jobId: string;
  admins: { id: string; name: string }[];
}) {
  if (admins.length === 0) {
    return (
      <p className="text-sm text-ht-muted">
        Add opportunity admins on Members, then assign them here.
      </p>
    );
  }

  return (
    <form action={delegateEvent} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="jobId" value={jobId} />
      <label className="space-y-1.5">
        <span className="ht-label block text-ht-muted">Opportunity admin</span>
        <select
          name="adminId"
          required
          defaultValue=""
          className="border-2 border-ht-line bg-ht-panel px-3 py-2 text-sm text-ht-cream focus:border-ht-gold focus:outline-none"
        >
          <option value="" disabled>
            Choose someone…
          </option>
          {admins.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </label>
      <Button type="submit" size="sm">
        Assign to this opportunity
      </Button>
    </form>
  );
}
