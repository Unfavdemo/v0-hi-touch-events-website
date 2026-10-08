"use client";

import { useActionState } from "react";
import { Button } from "@/components/network/ui/Button";
import { Textarea } from "@/components/network/ui/Textarea";
import type { ActionState } from "@/lib/network/auth-actions";
import { postJobMessage } from "@/lib/network/message-actions";

export function JobMessageForm({ jobId }: { jobId: string }) {
  const [state, formAction, pending] = useActionState(postJobMessage, {} as ActionState);
  return (
    <form action={formAction} className="mt-4 space-y-3">
      <input type="hidden" name="jobId" value={jobId} />
      <Textarea
        name="body"
        label="Message"
        required
        maxLength={2000}
        rows={3}
        className="min-h-[5rem]"
        placeholder="Load-in door, parking, timing…"
      />
      {state.error ? <p className="text-sm text-ht-danger">{state.error}</p> : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Sending…" : "Send"}
      </Button>
    </form>
  );
}
