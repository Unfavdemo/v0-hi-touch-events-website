"use client";

import { useActionState } from "react";
import { Button } from "@/components/network/ui/Button";
import { Input } from "@/components/network/ui/Input";
import { Textarea } from "@/components/network/ui/Textarea";
import { createVenue, deleteVenue, updateVenue } from "@/lib/network/venue-actions";

export interface VenueFields {
  id: string;
  name: string;
  address: string;
  notes: string | null;
  contactName: string | null;
  contactPhone: string | null;
}

function VenueFieldsForm({
  venue,
}: {
  venue?: VenueFields;
}) {
  const action = venue ? updateVenue.bind(null, venue.id) : createVenue;
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-4">
      <Input
        label="Venue name"
        name="name"
        required
        placeholder="Center City ballroom"
        defaultValue={venue?.name ?? ""}
      />
      <Input
        label="Address"
        name="address"
        required
        placeholder="Street, city, state, ZIP — or a venue nickname plus city"
        defaultValue={venue?.address ?? ""}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="On-site contact (optional)"
          name="contactName"
          defaultValue={venue?.contactName ?? ""}
        />
        <Input
          label="Contact phone (optional)"
          name="contactPhone"
          type="tel"
          defaultValue={venue?.contactPhone ?? ""}
        />
      </div>
      <Textarea
        label="Load-in, parking, or notes (optional)"
        name="notes"
        placeholder="Loading dock on 18th St, park in garage B, security desk at 6pm..."
        defaultValue={venue?.notes ?? ""}
      />
      {state.error ? <p className="text-sm text-ht-danger">{state.error}</p> : null}
      {state.ok && !venue ? <p className="text-sm text-ht-gold">Venue saved.</p> : null}
      {state.ok && venue ? <p className="text-sm text-ht-gold">Updated.</p> : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving…" : venue ? "Save venue" : "Add venue"}
      </Button>
    </form>
  );
}

export function VenueManager({ venues }: { venues: VenueFields[] }) {
  return (
    <div className="space-y-6">
      {venues.length === 0 ? (
        <p className="text-sm text-ht-muted">
          Save ballrooms, offices, and other sites you use often. They show up when you post
          an opportunity.
        </p>
      ) : (
        <ul className="space-y-4">
          {venues.map((venue) => (
            <li key={venue.id} className="border-2 border-ht-line bg-ht-panel p-5">
              <VenueFieldsForm venue={venue} />
              <form action={deleteVenue.bind(null, venue.id)} className="mt-3">
                <Button type="submit" size="sm" variant="ghost">
                  Remove
                </Button>
              </form>
            </li>
          ))}
        </ul>
      )}
      <div className="border-2 border-dashed border-ht-line bg-ht-panel p-5">
        <p className="ht-label text-ht-muted">New venue</p>
        <div className="mt-4">
          <VenueFieldsForm />
        </div>
      </div>
    </div>
  );
}
