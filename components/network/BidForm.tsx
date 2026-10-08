"use client";

import { useActionState, useId, type ReactNode } from "react";
import { Button } from "@/components/network/ui/Button";
import { Input } from "@/components/network/ui/Input";
import { Textarea } from "@/components/network/ui/Textarea";
import { submitBid } from "@/lib/network/jobs";

export function BidForm({
  jobId,
  extraActions,
}: {
  jobId: string;
  extraActions?: ReactNode;
}) {
  const formId = useId();
  const action = submitBid.bind(null, jobId);
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <div className="space-y-4">
      <form id={formId} action={formAction} className="space-y-4">
        <Input
          label="Your quote (USD)"
          name="amount"
          type="number"
          min="1"
          step="0.01"
          required
          placeholder="750"
        />
        <Textarea
          label="Notes (optional)"
          name="notes"
          placeholder="Relevant experience, equipment you bring, crew size..."
        />
        {state.error ? (
          <p className="border-2 border-ht-danger/60 bg-ht-panel px-4 py-3 text-sm text-ht-danger">
            {state.error}
          </p>
        ) : null}
      </form>
      <div className="flex flex-wrap items-center gap-3">
        <Button form={formId} type="submit" variant="blue" disabled={pending}>
          {pending ? "Submitting…" : "Submit application"}
        </Button>
        {extraActions}
      </div>
    </div>
  );
}
