"use client";

import { useActionState } from "react";
import { Button } from "@/components/network/ui/Button";
import { Input } from "@/components/network/ui/Input";
import { Textarea } from "@/components/network/ui/Textarea";
import {
  addOpportunityDocumentRequirement,
  removeOpportunityDocumentRequirement,
} from "@/lib/network/job-requirement-actions";

export function OpportunityRequiredDocumentsManager({
  jobId,
  requirements,
  eventRequirements,
  eventName,
  canEdit,
}: {
  jobId: string;
  requirements: { id: string; label: string; description?: string | null }[];
  eventRequirements?: { label: string; description: string | null }[];
  eventName?: string | null;
  canEdit: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    addOpportunityDocumentRequirement.bind(null, jobId),
    {},
  );

  return (
    <section className="border-2 border-ht-line bg-ht-panel p-6">
      <h2 className="text-lg font-semibold text-ht-cream">Required documents (this opportunity)</h2>
      <p className="mt-2 max-w-2xl text-sm text-ht-muted">
        Vendors already have W-9, vendor agreement, and HiTouch COI on file. Add only what this
        event or role still needs — matching uploads are required before they apply.
      </p>

      {eventRequirements && eventRequirements.length > 0 ? (
        <div className="mt-4 border-2 border-ht-gold/30 bg-ht-panel/80 p-4">
          <p className="ht-label text-ht-gold">
            From event{eventName ? `: ${eventName}` : ""} (all roles)
          </p>
          <p className="mt-1 text-xs text-ht-muted">
            Edit these on the event page — they apply to every linked opportunity.
          </p>
          <ul className="mt-3 space-y-2 text-sm text-ht-cream">
            {eventRequirements.map((r) => (
              <li key={r.label}>
                {r.label}
                {r.description ? (
                  <span className="block text-xs text-ht-muted">{r.description}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {requirements.length > 0 ? (
        <ul className="mt-4 divide-y-2 divide-ht-line border-2 border-ht-line">
          {requirements.map((r) => (
            <li key={r.id} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-medium text-ht-cream">{r.label}</p>
                {r.description ? (
                  <p className="mt-1 text-sm text-ht-muted">{r.description}</p>
                ) : null}
              </div>
              {canEdit ? (
                <form action={removeOpportunityDocumentRequirement.bind(null, r.id)}>
                  <Button type="submit" size="sm" variant="danger">
                    Remove
                  </Button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-ht-muted">
          {eventRequirements && eventRequirements.length > 0
            ? "No role-specific documents — the event requirements above are all that’s added beyond HiTouch paperwork."
            : "No event- or role-specific documents yet — HiTouch paperwork on file is enough to apply."}
        </p>
      )}

      {canEdit ? (
        <form action={formAction} className="mt-6 max-w-md space-y-3 border-t border-ht-line pt-6">
          <Input
            name="label"
            label="Document name"
            required
            placeholder="Venue permit, client COI rider, safety checklist…"
          />
          <Textarea
            name="description"
            label="Description for vendors (optional)"
            rows={2}
            placeholder="What to include, naming rules, or where to get the form…"
          />
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Adding…" : "Add to opportunity"}
          </Button>
          {state.error ? <p className="text-sm text-ht-danger">{state.error}</p> : null}
          {state.ok ? <p className="text-sm text-ht-gold">Vendors will see this requirement.</p> : null}
        </form>
      ) : null}
    </section>
  );
}
