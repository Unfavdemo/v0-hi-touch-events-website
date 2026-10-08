"use client";

import { useActionState } from "react";
import { Button } from "@/components/network/ui/Button";
import { Input } from "@/components/network/ui/Input";
import { savePlatformSettings } from "@/lib/network/settings-actions";

export function SettingsForm({
  warningThreshold,
  dismissalThreshold,
  inviteTarget,
  sendMoreExtra,
}: {
  warningThreshold: number;
  dismissalThreshold: number;
  inviteTarget: number;
  sendMoreExtra: number;
}) {
  const [state, formAction, pending] = useActionState(savePlatformSettings, {});
  return (
    <form action={formAction} className="max-w-md space-y-4">
      <Input
        name="warningThreshold"
        type="number"
        step="0.1"
        min={1}
        max={5}
        label="Rating warning threshold"
        defaultValue={warningThreshold}
        required
      />
      <Input
        name="dismissalThreshold"
        type="number"
        step="0.1"
        min={1}
        max={5}
        label="Dismissal flag threshold"
        defaultValue={dismissalThreshold}
        required
      />
      <Input
        name="inviteTarget"
        type="number"
        min={1}
        max={50}
        label="Invites per opportunity"
        defaultValue={inviteTarget}
        required
      />
      <Input
        name="sendMoreExtra"
        type="number"
        min={1}
        max={20}
        label="Extra invites when you send more"
        defaultValue={sendMoreExtra}
        required
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save settings"}
      </Button>
      {state.error ? <p className="text-sm text-ht-danger">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-ht-gold">Saved.</p> : null}
    </form>
  );
}
