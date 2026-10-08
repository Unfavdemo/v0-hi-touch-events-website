"use client";

import { useTransition } from "react";
import { deleteBlackout } from "@/lib/network/vendor-blackout-actions";

export function DeleteBlackoutButton({ blackoutId }: { blackoutId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => deleteBlackout(blackoutId))}
      className="ht-label text-ht-danger hover:text-ht-gold-bright disabled:opacity-50"
    >
      {pending ? "Removing…" : "Remove"}
    </button>
  );
}
