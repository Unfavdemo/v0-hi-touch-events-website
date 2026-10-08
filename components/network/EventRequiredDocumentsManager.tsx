"use client";

import { useActionState } from "react";
import { Button } from "@/components/network/ui/Button";
import { Input } from "@/components/network/ui/Input";
import { Textarea } from "@/components/network/ui/Textarea";
import {
  addEventDocumentFromTemplateAction,
  addEventDocumentRequirement,
  removeEventDocumentRequirement,
} from "@/lib/network/event-requirement-actions";

export function EventRequiredDocumentsManager({
  eventId,
  requirements,
  partnerTemplates,
  canEdit,
}: {
  eventId: string;
  requirements: { id: string; label: string; description: string | null }[];
  partnerTemplates?: { id: string; label: string; description: string | null }[];
  canEdit: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    addEventDocumentRequirement.bind(null, eventId),
    {},
  );

  const onEventTemplates = partnerTemplates?.filter(
    (t) => !requirements.some((r) => r.label.toLowerCase() === t.label.toLowerCase()),
  );

  return (
    <section className="border-2 border-ht-gold/40 bg-ht-panel p-6">
      <h2 className="text-lg font-semibold text-ht-cream">Required documents (whole event)</h2>
      <p className="mt-2 max-w-2xl text-sm text-ht-muted">
        Vendors already have W-9, vendor agreement, and HiTouch COI on file. Add only what this
        event requires for <strong className="text-ht-cream">every linked role</strong> — role-only
        extras go on the opportunity page.
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
                <form action={removeEventDocumentRequirement.bind(null, r.id)}>
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
          No event-specific documents yet — HiTouch paperwork on file is enough to apply.
        </p>
      )}

      {canEdit ? (
        <div className="mt-6 space-y-6 border-t border-ht-line pt-6">
          {onEventTemplates && onEventTemplates.length > 0 ? (
            <div>
              <p className="ht-label text-ht-cream">From organization templates</p>
              <ul className="mt-2 space-y-2">
                {onEventTemplates.map((t) => (
                  <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="text-ht-cream">
                      {t.label}
                      {t.description ? (
                        <span className="block text-xs text-ht-muted">{t.description}</span>
                      ) : null}
                    </span>
                    <form
                      action={addEventDocumentFromTemplateAction.bind(null, eventId, t.id)}
                    >
                      <Button type="submit" size="sm" variant="ghost">
                        Add to event
                      </Button>
                    </form>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <form action={formAction} className="max-w-md space-y-3">
            <Input
              name="label"
              label="Add custom document"
              required
              placeholder="Venue COI rider, site permit…"
            />
            <Textarea
              name="description"
              label="Description for vendors (optional)"
              rows={2}
              placeholder="Must list the client as additional insured."
            />
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Adding…" : "Add to event"}
            </Button>
            {state.error ? <p className="text-sm text-ht-danger">{state.error}</p> : null}
            {state.ok ? <p className="text-sm text-ht-gold">Saved for all roles on this event.</p> : null}
          </form>
        </div>
      ) : null}
    </section>
  );
}
