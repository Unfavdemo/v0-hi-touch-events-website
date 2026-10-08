"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { EventTimesTip, OpenBoardTip } from "@/components/network/help/FormTips";
import { Button } from "@/components/network/ui/Button";
import { Input } from "@/components/network/ui/Input";
import { Select } from "@/components/network/ui/Select";
import { Textarea } from "@/components/network/ui/Textarea";
import { createJob, updateJob } from "@/lib/network/jobs";

interface TagOption {
  id: string;
  name: string;
}

export interface JobFormVenue {
  id: string;
  name: string;
  address: string;
  notes: string | null;
  contactName: string | null;
  contactPhone: string | null;
}

export interface JobFormDefaults {
  title?: string;
  description?: string;
  categoryTagId?: string;
  payRate?: string;
  location?: string;
  isOpenBidding?: boolean;
  sourceTitle?: string;
  requirementIds?: string[];
  customRequirementLabels?: string;
  setupTime?: string;
  eventStartTime?: string;
  eventEndTime?: string;
  breakdownTime?: string;
}

export function JobForm({
  tags,
  defaults,
  venues,
  partnerRequirements,
  posterKind = "partner",
  partnerEvents,
  defaultPartnerEventId,
  returnToEvent,
  editJobId,
}: {
  tags: TagOption[];
  defaults?: JobFormDefaults;
  venues?: JobFormVenue[];
  partnerRequirements?: { id: string; label: string; description: string | null }[];
  posterKind?: "partner" | "admin";
  partnerEvents?: { id: string; name: string }[];
  defaultPartnerEventId?: string;
  returnToEvent?: boolean;
  editJobId?: string;
}) {
  const [state, formAction, pending] = useActionState(
    editJobId ? updateJob.bind(null, editJobId) : createJob,
    {},
  );
  const editing = Boolean(editJobId);
  const [location, setLocation] = useState(defaults?.location ?? "");
  const [venueId, setVenueId] = useState("");
  const duplicating = Boolean(defaults?.sourceTitle);
  const selectedVenue = useMemo(
    () => venues?.find((v) => v.id === venueId) ?? null,
    [venues, venueId],
  );

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      {duplicating ? (
        <p className="border-2 border-ht-blue/60 bg-ht-panel px-4 py-3 text-sm text-ht-blue-bright">
          Copied from “{defaults?.sourceTitle}”. Pick the new schedule — everything else is
          filled in.
        </p>
      ) : null}

      {returnToEvent ? <input type="hidden" name="returnToEvent" value="1" /> : null}

      {posterKind === "admin" && defaultPartnerEventId && !editing ? (
        <input type="hidden" name="partnerEventId" value={defaultPartnerEventId} />
      ) : null}

      {posterKind === "partner" && partnerEvents && partnerEvents.length > 0 ? (
        <Select
          name="partnerEventId"
          label="Part of event (optional)"
          defaultValue={defaultPartnerEventId ?? ""}
        >
          <option value="">— Standalone opportunity —</option>
          {partnerEvents.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.name}
            </option>
          ))}
        </Select>
      ) : null}

      <Input
        label="Opportunity title"
        name="title"
        required
        placeholder="Corporate gala — open-format DJ"
        defaultValue={defaults?.title ?? ""}
      />

      <Textarea
        label="Description"
        name="description"
        required
        placeholder="Scope, headcount, equipment expectations, dress code..."
        defaultValue={defaults?.description ?? ""}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Select
          label="Category"
          name="categoryTagId"
          required
          defaultValue={defaults?.categoryTagId ?? ""}
        >
          <option value="" disabled>
            Select a category
          </option>
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </Select>
        <Input
          label="Pay rate (USD)"
          name="payRate"
          type="number"
          min="1"
          step="0.01"
          required
          placeholder="850"
          defaultValue={defaults?.payRate ?? ""}
        />
      </div>

      {venues && venues.length > 0 ? (
        <Select
          label="Saved venue"
          name="savedVenueId"
          value={venueId}
          onChange={(e) => {
            const next = e.target.value;
            setVenueId(next);
            const venue = venues.find((v) => v.id === next);
            if (venue) setLocation(venue.address);
          }}
        >
          <option value="">Type a location, or pick a saved venue</option>
          {venues.map((venue) => (
            <option key={venue.id} value={venue.id}>
              {venue.name}
            </option>
          ))}
        </Select>
      ) : null}

      <Input
        label="Location"
        name="location"
        required
        placeholder="Philadelphia, PA — Center City ballroom"
        value={location}
        onChange={(e) => {
          setLocation(e.target.value);
          setVenueId("");
        }}
      />
      {selectedVenue?.notes || selectedVenue?.contactName ? (
        <p className="text-sm text-ht-muted">
          {selectedVenue.contactName
            ? `On-site: ${selectedVenue.contactName}${selectedVenue.contactPhone ? ` · ${selectedVenue.contactPhone}` : ""}`
            : null}
          {selectedVenue.contactName && selectedVenue.notes ? " — " : null}
          {selectedVenue.notes}
        </p>
      ) : null}
      {venues ? (
        <p className="text-xs text-ht-muted">
          <Link href="/network/partner/organization" className="text-ht-gold hover:text-ht-gold-bright">
            Manage saved venues
          </Link>{" "}
          on Organization.
        </p>
      ) : null}

      <fieldset className="border-2 border-ht-line p-5">
        <legend className="ht-label px-2 text-ht-muted">
          Schedule
          <EventTimesTip />
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Setup arrival"
            name="setupTime"
            type="datetime-local"
            required
            defaultValue={defaults?.setupTime ?? ""}
          />
          <Input
            label="Live start"
            name="eventStartTime"
            type="datetime-local"
            required
            defaultValue={defaults?.eventStartTime ?? ""}
          />
          <Input
            label="Live end"
            name="eventEndTime"
            type="datetime-local"
            required
            defaultValue={defaults?.eventEndTime ?? ""}
          />
          <Input
            label="Breakdown"
            name="breakdownTime"
            type="datetime-local"
            required
            defaultValue={defaults?.breakdownTime ?? ""}
          />
        </div>
      </fieldset>

      <label className="flex items-center gap-3 border-2 border-ht-line bg-ht-panel px-4 py-3">
        <input
          type="checkbox"
          name="isOpenBidding"
          className="h-4 w-4 accent-[#34318f]"
          defaultChecked={defaults?.isOpenBidding ?? false}
        />
        <span className="text-sm text-ht-cream">
          Also list on the open job board — any vendor in this category can apply, not
          only the ones we invite
        </span>
        <OpenBoardTip />
      </label>

      {!editing ? (
      <fieldset className="border-2 border-ht-gold/40 bg-ht-panel/50 p-5">
        <legend className="ht-label px-2 text-ht-gold">Required documents for this opportunity</legend>
        <p className="mb-4 text-sm text-ht-muted">
          Vendors are told they need HiTouch paperwork plus anything you list here before they
          can apply. Upload names must match exactly under{" "}
          <strong className="text-ht-cream">Other documents</strong> on their Documents page.
        </p>
        <ul className="space-y-1 text-sm text-ht-muted">
          <li>· Form W-9, vendor agreement, and HiTouch COI (always — HiTouch)</li>
        </ul>
        {posterKind === "partner" && partnerRequirements && partnerRequirements.length > 0 ? (
          <div className="mt-4 space-y-2">
            <p className="ht-label text-ht-cream">From your organization templates</p>
            {partnerRequirements.map((r) => (
              <label key={r.id} className="flex items-start gap-2 text-sm text-ht-cream">
                <input
                  type="checkbox"
                  name="partnerRequirementId"
                  value={r.id}
                  className="mt-1 accent-ht-gold"
                  defaultChecked={defaults?.requirementIds?.includes(r.id)}
                />
                <span>
                  {r.label}
                  {r.description ? (
                    <span className="block text-xs text-ht-muted">{r.description}</span>
                  ) : null}
                </span>
              </label>
            ))}
            <p className="text-xs text-ht-muted">
              Manage templates on{" "}
              <span className="text-ht-cream">Organization → Required documents</span>.
            </p>
          </div>
        ) : posterKind === "partner" ? (
          <p className="mt-3 text-xs text-ht-muted">
            Save reusable names under Organization → Required documents, then check them here when
            you post.
          </p>
        ) : null}
        <div className="mt-4">
          <Textarea
            label={
              posterKind === "admin"
                ? "Documents required for this opportunity"
                : "Additional documents for this posting"
            }
            name="customRequirementLabels"
            rows={4}
            placeholder={
              posterKind === "admin"
                ? "Client venue permit | City form from venue ops\nSigned safety checklist | Must be signed by your supervisor\nCOI rider | List client as additional insured"
                : "Client venue permit | Upload the PDF from the venue\nOne-off checklist | Signed copy required"
            }
            defaultValue={defaults?.customRequirementLabels ?? ""}
          />
          <p className="text-xs text-ht-muted">
            One document per line. Add an optional description after{" "}
            <strong className="text-ht-cream"> | </strong> (vendors see it before they apply).
            You can add more later on the opportunity page.
          </p>
        </div>
      </fieldset>
      ) : (
        <p className="border-2 border-ht-line bg-ht-panel px-4 py-3 text-sm text-ht-muted">
          Required documents are managed on the opportunity detail page.
        </p>
      )}

      {state.error ? (
        <p className="border-2 border-ht-danger/60 bg-ht-panel px-4 py-3 text-sm text-ht-danger">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending
          ? "Saving…"
          : editing
            ? "Save opportunity"
            : "Submit opportunity"}
      </Button>
    </form>
  );
}
