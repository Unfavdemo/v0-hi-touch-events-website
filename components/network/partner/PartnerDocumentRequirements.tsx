"use client";

import { useActionState } from "react";
import { Button } from "@/components/network/ui/Button";
import { Input } from "@/components/network/ui/Input";
import { Textarea } from "@/components/network/ui/Textarea";
import {
  addPartnerDocumentRequirement,
  removePartnerDocumentRequirement,
} from "@/lib/network/partner-requirement-actions";

export function PartnerDocumentRequirementsManager({
  requirements,
  canEdit,
}: {
  requirements: { id: string; label: string; description: string | null }[];
  canEdit: boolean;
}) {
  const [state, formAction, pending] = useActionState(addPartnerDocumentRequirement, {});

  return (
    <section className="border-2 border-ht-line bg-ht-panel p-6">
      <h2 className="text-lg font-semibold text-ht-cream">Required documents (client)</h2>
      <p className="mt-2 max-w-2xl text-sm text-ht-muted">
        Templates you can attach when you post an opportunity. Vendors must upload matching files
        under <strong className="text-ht-cream">Other documents</strong> (same name) before they
        can apply. HiTouch always requires W-9, vendor agreement, and HiTouch COI on top of these.
      </p>

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
                <form action={removePartnerDocumentRequirement.bind(null, r.id)}>
                  <Button type="submit" size="sm" variant="danger">
                    Remove
                  </Button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-ht-muted">No client templates yet.</p>
      )}

      {canEdit ? (
        <form action={formAction} className="mt-6 max-w-lg space-y-3 border-t border-ht-line pt-6">
          <Input
            name="label"
            label="Document name"
            required
            placeholder="Client COI — additional insured rider"
          />
          <Textarea
            name="description"
            label="Notes for vendors (optional)"
            rows={2}
            placeholder="Must list Vested In Events as additional insured."
          />
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Adding…" : "Add requirement"}
          </Button>
          {state.error ? <p className="text-sm text-ht-danger">{state.error}</p> : null}
          {state.ok ? <p className="text-sm text-ht-gold">Saved.</p> : null}
        </form>
      ) : null}
    </section>
  );
}
