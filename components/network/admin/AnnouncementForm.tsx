"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/network/ui/Button";
import { Select } from "@/components/network/ui/Select";
import { Textarea } from "@/components/network/ui/Textarea";
import { sendAnnouncement } from "@/lib/network/announcement-actions";

type OpportunityOption = {
  id: string;
  title: string;
  eventStartLabel: string;
};

export function AnnouncementForm({
  tags,
  opportunities,
  defaultJobId,
}: {
  tags: { id: string; name: string }[];
  opportunities: OpportunityOption[];
  defaultJobId?: string;
}) {
  const [state, formAction, pending] = useActionState(sendAnnouncement, {});
  const [audience, setAudience] = useState(defaultJobId ? "opportunity" : "vendors");

  return (
    <form action={formAction} className="space-y-4">
      <Select
        name="audience"
        label="Audience"
        required
        value={audience}
        onChange={(e) => setAudience(e.target.value)}
      >
        <option value="vendors">All vendors</option>
        <option value="partners">All partners</option>
        <option value="skill">One skill</option>
        <option value="membership">Membership status</option>
        <option value="opportunity">One opportunity</option>
      </Select>
      <Select name="skillTagId" label="Skill (if one skill)" defaultValue="">
        <option value="">—</option>
        {tags.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </Select>
      <Select name="membershipStatus" label="Membership (if that audience)" defaultValue="">
        <option value="">—</option>
        <option value="INCOMPLETE">Payment not finished</option>
        <option value="ACTIVE">Active</option>
        <option value="PAST_DUE">Payment overdue</option>
        <option value="CANCELED">Canceled</option>
        <option value="TRIALING">Free trial</option>
      </Select>

      {audience === "opportunity" ? (
        <>
          <Select
            name="jobId"
            label="Opportunity"
            required
            defaultValue={defaultJobId ?? ""}
          >
            <option value="">— Pick an opportunity —</option>
            {opportunities.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title} · {j.eventStartLabel}
              </option>
            ))}
          </Select>
          <Select name="opportunityScope" label="Who on that opportunity" required defaultValue="everyone">
            <option value="everyone">Everyone (partner + all vendors tied to it)</option>
            <option value="all_vendors">All vendors (hired, invited, applicants)</option>
            <option value="hired">Hired vendor only</option>
            <option value="invited">Invited vendors</option>
            <option value="applicants">Applicants (submitted a bid)</option>
            <option value="partner">Posting partner only</option>
          </Select>
        </>
      ) : (
        <>
          <input type="hidden" name="jobId" value="" />
          <input type="hidden" name="opportunityScope" value="" />
        </>
      )}

      <Textarea name="message" label="Message" required minLength={3} />

      <fieldset className="space-y-3 border-2 border-ht-line p-4">
        <legend className="ht-label px-2 text-ht-muted">Send via</legend>
        <p className="text-sm text-ht-muted">
          Choose one or more channels. Text goes to the phone on each person&apos;s profile.
        </p>
        <label className="flex items-center gap-3 text-sm text-ht-cream">
          <input
            type="checkbox"
            name="sendInApp"
            defaultChecked
            className="h-4 w-4 accent-ht-gold"
          />
          In-app notification
        </label>
        <label className="flex items-center gap-3 text-sm text-ht-cream">
          <input type="checkbox" name="sendEmail" className="h-4 w-4 accent-ht-gold" />
          Email
        </label>
        <label className="flex items-center gap-3 text-sm text-ht-cream">
          <input type="checkbox" name="sendSms" className="h-4 w-4 accent-ht-gold" />
          Text message (SMS)
        </label>
      </fieldset>

      <Button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send announcement"}
      </Button>
      {state.error ? <p className="text-sm text-ht-danger">{state.error}</p> : null}
      {state.ok ? (
        <p className="text-sm text-ht-gold">{state.detail ?? "Sent."}</p>
      ) : null}
    </form>
  );
}
