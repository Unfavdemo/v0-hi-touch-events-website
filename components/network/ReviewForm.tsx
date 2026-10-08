"use client";

import { useActionState } from "react";
import { Button } from "@/components/network/ui/Button";
import { Select } from "@/components/network/ui/Select";
import { Textarea } from "@/components/network/ui/Textarea";
import { submitReview } from "@/lib/network/ratings";

export function ReviewForm({ jobId }: { jobId: string }) {
  const action = submitReview.bind(null, jobId);
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-4">
      <Select label="Stars (1–5)" name="stars" required defaultValue="5">
        {[5, 4, 3, 2, 1].map((n) => (
          <option key={n} value={n}>
            {"★".repeat(n)}
            {"☆".repeat(5 - n)} — {n}
          </option>
        ))}
      </Select>
      <Textarea
        label="Feedback"
        name="feedback"
        required
        placeholder="Punctuality, professionalism, quality of work..."
      />
      {state.error ? (
        <p className="border-2 border-ht-danger/60 bg-ht-panel px-4 py-3 text-sm text-ht-danger">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Submitting…" : "Submit review"}
      </Button>
    </form>
  );
}
