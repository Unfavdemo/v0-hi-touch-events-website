"use client";

import { useActionState } from "react";
import { Button } from "@/components/network/ui/Button";
import { Textarea } from "@/components/network/ui/Textarea";
import { sendPartnerEventDetailsToHired } from "@/lib/network/partner-event-admin-actions";

export function SendPartnerEventDetailsForm({ eventId }: { eventId: string }) {
  const [state, formAction, pending] = useActionState(sendPartnerEventDetailsToHired, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="eventId" value={eventId} />
      <Textarea
        name="message"
        label="Details for hired vendors"
        required
        rows={6}
        placeholder="Load-in address, parking, dress code, day-of contact, run of show…"
      />
      <fieldset className="space-y-3 border-2 border-ht-line p-4">
        <legend className="ht-label px-2 text-ht-muted">Send via</legend>
        <label className="flex items-center gap-3 text-sm text-ht-cream">
          <input type="checkbox" name="sendInApp" defaultChecked className="h-4 w-4 accent-ht-gold" />
          In-app notification
        </label>
        <label className="flex items-center gap-3 text-sm text-ht-cream">
          <input type="checkbox" name="sendEmail" className="h-4 w-4 accent-ht-gold" />
          Email
        </label>
        <label className="flex items-center gap-3 text-sm text-ht-cream">
          <input type="checkbox" name="sendSms" className="h-4 w-4 accent-ht-gold" />
          Text (SMS)
        </label>
      </fieldset>
      <Button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send to hired vendors"}
      </Button>
      {state.error ? <p className="text-sm text-ht-danger">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-ht-gold">{state.detail}</p> : null}
    </form>
  );
}
