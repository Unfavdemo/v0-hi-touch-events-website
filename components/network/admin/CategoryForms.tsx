"use client";

import { useActionState } from "react";
import { Button } from "@/components/network/ui/Button";
import { Input } from "@/components/network/ui/Input";
import { createCategoryTag, renameCategoryTag } from "@/lib/network/category-actions";

export function CreateCategoryForm() {
  const [state, formAction, pending] = useActionState(createCategoryTag, {});
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <Input name="name" label="New category" required placeholder="Floral" />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Adding…" : "Add"}
      </Button>
      {state.error ? <p className="text-sm text-ht-danger">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-ht-gold">Added.</p> : null}
    </form>
  );
}

export function RenameCategoryForm({ id, name }: { id: string; name: string }) {
  const [state, formAction, pending] = useActionState(renameCategoryTag, {});
  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <input
        name="name"
        defaultValue={name}
        required
        className="border-2 border-ht-line bg-ht-black px-2 py-1 text-sm text-ht-cream"
      />
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        Rename
      </Button>
      {state.error ? <p className="text-xs text-ht-danger">{state.error}</p> : null}
      {state.ok ? <p className="text-xs text-ht-gold">Saved.</p> : null}
    </form>
  );
}
