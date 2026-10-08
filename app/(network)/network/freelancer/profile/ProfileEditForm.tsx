"use client";

import { useActionState } from "react";
import { ImageDropField } from "@/components/network/ImageDropField";
import { Button } from "@/components/network/ui/Button";
import { Input } from "@/components/network/ui/Input";
import { Textarea } from "@/components/network/ui/Textarea";
import { updateFreelancerProfile } from "@/lib/network/profile-actions";
import { parseSocialLinks } from "@/lib/network/social";
import { cn } from "@/lib/network/utils";

interface TagOption {
  id: string;
  name: string;
}

interface ProfileFormValues {
  name: string;
  type: "INDIVIDUAL" | "BUSINESS";
  phone?: string | null;
  mailingAddress?: string | null;
  accountEmail?: string | null;
  bio?: string | null;
  companyName?: string | null;
  headshotUrl?: string | null;
  logoUrl?: string | null;
  socialLinks: unknown;
  categoryTagIds: string[];
  defaultRate?: string | number;
  travelRadiusMiles?: number | string;
  crewSize?: number | string;
  equipmentNotes?: string | null;
}

export function ProfileEditForm({
  profile,
  tags,
}: {
  profile: ProfileFormValues;
  tags: TagOption[];
}) {
  const [state, formAction, pending] = useActionState(updateFreelancerProfile, {});
  const socials = parseSocialLinks(profile.socialLinks);

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <Input label="Display name" name="name" required defaultValue={profile.name} />

      {profile.type === "BUSINESS" ? (
        <>
          <Input
            label="Business name"
            name="companyName"
            required
            defaultValue={profile.companyName ?? ""}
          />
          <ImageDropField
            label="Company logo or owner photo"
            existingSrc={profile.logoUrl}
            previewAlt={profile.companyName ?? profile.name}
          />
        </>
      ) : (
        <ImageDropField
          label="Headshot"
          existingSrc={profile.headshotUrl}
          previewAlt={profile.name}
        />
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Phone for calls and texts"
          name="phone"
          type="tel"
          required
          defaultValue={profile.phone ?? ""}
          hint="Partners and HiTouch will use this to call or text you"
        />
        <Input
          label="Public email"
          name="contactEmail"
          type="email"
          defaultValue={socials.email ?? profile.accountEmail ?? ""}
          placeholder="you@studio.example"
          hint="Shown on your public profile for partners"
        />
      </div>
      <Input
        label={profile.type === "BUSINESS" ? "Business mailing address" : "Mailing address"}
        name="mailingAddress"
        required
        defaultValue={profile.mailingAddress ?? ""}
        placeholder="Street, city, state, ZIP"
      />
      <Textarea
        label="Bio"
        name="bio"
        defaultValue={profile.bio ?? ""}
        placeholder="Service area, crew size, notable opportunities, what you bring to a call..."
      />

      <div className="border-t border-ht-line pt-6">
        <p className="ht-label text-ht-muted">Service card</p>
        <p className="mt-1 text-xs text-ht-muted">
          Shown on your public profile — typical rate, travel, and what you bring.
        </p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <Input
            label="Typical rate (USD)"
            name="defaultRate"
            type="number"
            min={0}
            step="0.01"
            defaultValue={profile.defaultRate ?? ""}
            placeholder="850"
          />
          <Input
            label="Travel radius (miles)"
            name="travelRadiusMiles"
            type="number"
            min={0}
            defaultValue={profile.travelRadiusMiles ?? ""}
            placeholder="75"
          />
          <Input
            label="Typical crew size"
            name="crewSize"
            type="number"
            min={0}
            defaultValue={profile.crewSize ?? ""}
            placeholder="4"
          />
        </div>
        <Textarea
          label="Equipment & services"
          name="equipmentNotes"
          className="mt-4"
          defaultValue={profile.equipmentNotes ?? ""}
          placeholder="Sound, lighting, linens, staffing…"
        />
      </div>

      <div>
        <p className="ht-label text-ht-muted">Skill categories</p>
        <p className="mt-1 text-xs text-ht-muted">
          You&apos;re only matched and invited to opportunities in these categories.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-px border-2 border-ht-line bg-ht-line sm:grid-cols-3">
          {tags.map((tag) => {
            const checked = profile.categoryTagIds.includes(tag.id);
            return (
              <label
                key={tag.id}
                className={cn(
                  "flex cursor-pointer items-center gap-2 bg-ht-panel px-3 py-2.5 text-base has-[:checked]:bg-ht-blue has-[:checked]:text-white",
                )}
              >
                <input
                  type="checkbox"
                  name="categoryTagIds"
                  value={tag.id}
                  defaultChecked={checked}
                  className="accent-[#34318f]"
                />
                {tag.name}
              </label>
            );
          })}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Instagram"
          name="instagram"
          defaultValue={socials.instagram ?? ""}
          placeholder="@handle"
        />
        <Input
          label="Facebook"
          name="facebook"
          defaultValue={socials.facebook ?? ""}
          placeholder="Page or URL"
        />
        <Input
          label="TikTok"
          name="tiktok"
          defaultValue={socials.tiktok ?? ""}
          placeholder="@handle"
        />
        <Input
          label="LinkedIn"
          name="linkedin"
          defaultValue={socials.linkedin ?? ""}
          placeholder="linkedin.com/in/you or handle"
        />
        <Input
          label="Your website"
          name="website"
          defaultValue={socials.website ?? ""}
          placeholder="yourstudio.com"
        />
      </div>

      {state.error ? (
        <p className="border-2 border-ht-danger/60 px-4 py-3 text-sm text-ht-danger">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="border-2 border-ht-gold/60 px-4 py-3 text-sm text-ht-gold">
          Profile saved. Your public page is updated.
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
