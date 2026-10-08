"use client";

import { useActionState } from "react";
import { Button } from "@/components/network/ui/Button";
import { Input } from "@/components/network/ui/Input";
import { Textarea } from "@/components/network/ui/Textarea";
import { registerPartner } from "@/lib/network/auth-actions";

export function PartnerJoinForm() {
  const [state, formAction, pending] = useActionState(registerPartner, {});

  return (
    <form action={formAction} className="space-y-5">
      <Input label="Company name" name="companyName" required placeholder="Vested In Events" />
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Contact person" name="contactPerson" required placeholder="Dana Reyes" />
        <Input
          label="Phone for calls and texts"
          name="phone"
          type="tel"
          required
          placeholder="215-555-0142"
          hint="We'll call or text this number about opportunities"
        />
      </div>
      <Input
        label="Business mailing address"
        name="mailingAddress"
        required
        placeholder="Street, city, state, ZIP"
      />
      <Input
        label="Company website (optional)"
        name="website"
        placeholder="vestedinopportunities.com"
      />
      <Input label="Work email" name="email" type="email" required autoComplete="email" />
      <Input
        label="Password"
        name="password"
        type="password"
        required
        autoComplete="new-password"
        hint="At least 8 characters"
      />
      <Textarea
        label="What kind of opportunities do you run? (optional)"
        name="bio"
        placeholder="Corporate opportunities, galas, activations..."
      />
      {state.error ? (
        <p className="border-2 border-ht-danger/60 px-4 py-3 text-sm text-ht-danger">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Submitting…" : "Submit application"}
      </Button>
    </form>
  );
}
