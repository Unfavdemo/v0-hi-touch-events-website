"use client";

import { useActionState, useState } from "react";
import { FileDropField } from "@/components/network/FileDropField";
import { Button } from "@/components/network/ui/Button";
import { Input } from "@/components/network/ui/Input";
import { deleteVendorDocument, uploadVendorDocument } from "@/lib/network/document-actions";

export function SingletonDocumentForm({
  kind,
  label,
  stamp,
  hasExisting,
  viewHref,
}: {
  kind: "W9" | "COI";
  label: string;
  stamp: string;
  hasExisting: boolean;
  viewHref: string | null;
}) {
  const [state, formAction, pending] = useActionState(uploadVendorDocument, {});
  const [hasFile, setHasFile] = useState(false);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="kind" value={kind} />
      <FileDropField
        label={hasExisting ? `Replace ${label}` : `Upload ${label}`}
        stamp={stamp}
        name="file"
        hasExisting={hasExisting}
        existingLabel={`${label} on file`}
        emptyPrompt={`Drop your ${label} here, or click to browse`}
        hint="PDF, JPEG, or PNG, under 8 MB. You and HiTouch can always open this. Partners who hire you can open your W-9 and HiTouch COI."
        onFileChange={(file) => setHasFile(Boolean(file))}
      />
      {kind === "COI" ? (
        <Input
          label="Expires (optional)"
          name="expiresAt"
          type="date"
          hint="Certificates of insurance expire. Add the date so HiTouch can remind you."
        />
      ) : null}
      {state.error ? (
        <p className="text-sm text-ht-danger">{state.error}</p>
      ) : null}
      {state.ok ? <p className="text-sm text-ht-gold">Saved.</p> : null}
      {viewHref || hasFile ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {viewHref ? (
            <a
              href={viewHref}
              className="ht-label text-ht-gold hover:text-ht-gold-bright"
              target="_blank"
              rel="noreferrer"
            >
              View {label}
            </a>
          ) : (
            <span />
          )}
          {hasFile ? (
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Saving…" : hasExisting ? "Replace file" : "Save file"}
            </Button>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}

export function OtherDocumentForm() {
  const [state, formAction, pending] = useActionState(uploadVendorDocument, {});
  const [hasFile, setHasFile] = useState(false);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="kind" value="OTHER" />
      <Input
        label="What is this file?"
        name="label"
        required
        placeholder="Business license, rider, permit…"
      />
      <FileDropField
        label="File"
        stamp="DOC"
        name="file"
        emptyPrompt="Drop the file here, or click to browse"
        onFileChange={(file) => setHasFile(Boolean(file))}
      />
      {state.error ? (
        <p className="text-sm text-ht-danger">{state.error}</p>
      ) : null}
      {state.ok ? <p className="text-sm text-ht-gold">Added.</p> : null}
      {hasFile ? (
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Saving…" : "Add document"}
          </Button>
        </div>
      ) : null}
    </form>
  );
}

export function RemoveOtherDocumentButton({ id }: { id: string }) {
  return (
    <form action={deleteVendorDocument.bind(null, id)}>
      <Button type="submit" size="sm" variant="danger">
        Remove
      </Button>
    </form>
  );
}
