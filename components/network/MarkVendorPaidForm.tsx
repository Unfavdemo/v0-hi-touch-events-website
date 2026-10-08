"use client";

import { useActionState } from "react";
import { Button } from "@/components/network/ui/Button";
import { markVendorPaid } from "@/lib/network/partner-payment-actions";
import { VENDOR_PAY_METHODS } from "@/lib/network/vendor-pay";

export function MarkVendorPaidForm({
  jobId,
  amount,
}: {
  jobId: string;
  amount: string;
}) {
  const [state, formAction, pending] = useActionState(markVendorPaid, {});

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="jobId" value={jobId} />
      <input type="hidden" name="amount" value={amount} />
      <label className="space-y-1.5">
        <span className="ht-label block text-ht-muted">How you paid</span>
        <select
          name="method"
          required
          defaultValue="CHECK"
          aria-label="How you paid"
          className="border-2 border-ht-line bg-ht-panel px-3 py-2 text-sm text-ht-cream focus:border-ht-gold focus:outline-none"
        >
          {VENDOR_PAY_METHODS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </label>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving…" : "Mark as paid"}
      </Button>
      {state.error ? <p className="w-full text-sm text-ht-danger">{state.error}</p> : null}
    </form>
  );
}
