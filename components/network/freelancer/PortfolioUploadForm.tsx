"use client";

import { useActionState } from "react";
import { Button } from "@/components/network/ui/Button";
import { Input } from "@/components/network/ui/Input";
import { FileDropField } from "@/components/network/FileDropField";
import { RemoveOtherDocumentButton } from "@/components/network/VendorDocumentForms";
import { uploadVendorDocument } from "@/lib/network/document-actions";

export function PortfolioUploadForm() {
  const [state, formAction, pending] = useActionState(uploadVendorDocument, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="kind" value="PORTFOLIO" />
      <Input label="Caption" name="label" required placeholder="Gala setup, stage shot…" />
      <FileDropField
        label="Portfolio image"
        stamp="IMG"
        name="file"
        hasExisting={false}
        emptyPrompt="Drop a photo or PDF, or click to browse"
        hint="JPEG, PNG, or PDF under 8 MB. Shown on your public network page."
      />
      {state.error ? <p className="text-sm text-ht-danger">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-ht-gold">Portfolio item saved.</p> : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Uploading…" : "Add to portfolio"}
      </Button>
    </form>
  );
}

export function PortfolioItemRow({
  id,
  label,
}: {
  id: string;
  label: string;
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <a
        href={`/api/vendor-documents/${id}`}
        className="font-medium text-ht-cream hover:text-ht-gold"
        target="_blank"
        rel="noreferrer"
      >
        {label}
      </a>
      <RemoveOtherDocumentButton id={id} />
    </li>
  );
}
