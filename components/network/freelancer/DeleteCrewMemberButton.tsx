"use client";

import { useTransition } from "react";
import { deleteCrewMember } from "@/lib/network/vendor-crew-actions";

export function DeleteCrewMemberButton({ memberId }: { memberId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => deleteCrewMember(memberId))}
      className="ht-label text-ht-danger hover:text-ht-gold-bright disabled:opacity-50"
    >
      {pending ? "Removing…" : "Remove"}
    </button>
  );
}
