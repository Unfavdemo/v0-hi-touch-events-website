"use client";

import { useActionState } from "react";
import { ImageDropField } from "@/components/network/ImageDropField";
import { Button } from "@/components/network/ui/Button";
import { Input } from "@/components/network/ui/Input";
import { Textarea } from "@/components/network/ui/Textarea";
import { updatePartnerProfile } from "@/lib/network/profile-actions";
import { parseSocialLinks } from "@/lib/network/social";

interface PartnerOrgValues {
  companyName?: string | null;
  contactPerson?: string | null;
  name: string;
  phone?: string | null;
  mailingAddress?: string | null;
  bio?: string | null;
  logoUrl?: string | null;
  socialLinks: unknown;
}

export function PartnerOrgForm({ profile }: { profile: PartnerOrgValues }) {
  const [state, formAction, pending] = useActionState(updatePartnerProfile, {});
  const socials = parseSocialLinks(profile.socialLinks);

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <Input
        label="Company name"
        name="companyName"
        required
        defaultValue={profile.companyName ?? ""}
      />
      <ImageDropField
        label="Company logo"
        hint="Drop a JPEG, PNG, or WebP. Shown to vendors on your opportunities."
        existingSrc={profile.logoUrl}
        previewAlt={profile.companyName ?? profile.name}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Contact person"
          name="contactPerson"
          required
          defaultValue={profile.contactPerson ?? profile.name}
        />
        <Input
          label="Phone for calls and texts"
          name="phone"
          type="tel"
          required
          defaultValue={profile.phone ?? ""}
          hint="HiTouch and hired vendors will use this for day-of calls"
        />
      </div>
      <Input
        label="Business mailing address"
        name="mailingAddress"
        required
        defaultValue={profile.mailingAddress ?? ""}
        placeholder="Street, city, state, ZIP"
      />
      <Input
        label="Company website (optional)"
        name="website"
        defaultValue={socials.website ?? ""}
        placeholder="yourcompany.com"
      />
      <Textarea
        label="About your opportunities (optional)"
        name="bio"
        defaultValue={profile.bio ?? ""}
        placeholder="Corporate opportunities, galas, activations..."
      />

      {state.error ? (
        <p className="border-2 border-ht-danger/60 px-4 py-3 text-sm text-ht-danger">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="border-2 border-ht-gold/60 px-4 py-3 text-sm text-ht-gold">
          Organization saved.
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save organization"}
      </Button>
    </form>
  );
}
