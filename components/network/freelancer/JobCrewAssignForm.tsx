"use client";

import { useTransition } from "react";
import { Button } from "@/components/network/ui/Button";
import { setJobCrewAssignments } from "@/lib/network/vendor-crew-actions";

export function JobCrewAssignForm({
  jobId,
  members,
  assignedIds,
}: {
  jobId: string;
  members: { id: string; name: string; role: string }[];
  assignedIds: string[];
}) {
  const [pending, startTransition] = useTransition();

  if (members.length === 0) {
    return (
      <p className="text-sm text-ht-muted">
        Add crew on the <strong>Crew</strong> tab first, then assign them here.
      </p>
    );
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const ids = [...form.querySelectorAll<HTMLInputElement>('input[name="crew"]:checked')].map(
          (el) => el.value,
        );
        startTransition(() => setJobCrewAssignments(jobId, ids));
      }}
    >
      <ul className="space-y-2">
        {members.map((m) => (
          <li key={m.id}>
            <label className="flex cursor-pointer items-start gap-2 text-sm text-ht-cream">
              <input
                type="checkbox"
                name="crew"
                value={m.id}
                defaultChecked={assignedIds.includes(m.id)}
                className="mt-1 accent-[#34318f]"
              />
              <span>
                <span className="font-semibold">{m.name}</span>
                <span className="text-ht-muted"> — {m.role}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving…" : "Save crew for this opportunity"}
      </Button>
    </form>
  );
}
