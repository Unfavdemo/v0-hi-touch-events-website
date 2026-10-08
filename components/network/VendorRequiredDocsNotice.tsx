import Link from "next/link";
import type { ClientRequiredDoc } from "@/lib/network/document-requirements";

/** Shown to vendors so opportunity-specific document asks are obvious before they apply. */
export function VendorRequiredDocsNotice({
  clientDocs,
  clientLabels,
  compact,
}: {
  clientDocs?: ClientRequiredDoc[];
  /** @deprecated Prefer clientDocs */
  clientLabels?: string[];
  compact?: boolean;
}) {
  const docs: ClientRequiredDoc[] =
    clientDocs ??
    (clientLabels ?? []).map((label) => ({ label, description: null }));

  if (docs.length === 0) return null;

  const eventDocs = docs.filter((d) => d.source === "event");
  const roleDocs = docs.filter((d) => d.source !== "event");

  const renderList = (items: ClientRequiredDoc[]) => (
    <ul className="mt-2 space-y-2 text-sm text-ht-cream">
      {items.map((doc) => (
        <li key={`${doc.source ?? "x"}-${doc.label}`}>
          <span className="font-medium">{doc.label}</span>
          {doc.description ? (
            <p className="mt-1 text-xs text-ht-muted">{doc.description}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );

  return (
    <div
      className={
        compact
          ? "border-2 border-ht-gold/40 bg-ht-panel px-4 py-3"
          : "border-2 border-ht-gold/50 bg-ht-panel p-5"
      }
    >
      <p className="ht-label text-ht-gold">Required for this opportunity</p>
      <p className="mt-2 text-sm text-ht-cream">
        Upload these <strong>before you apply</strong> (plus W-9, vendor agreement, and HiTouch
        COI).
      </p>

      {eventDocs.length > 0 ? (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-ht-muted">
            Whole event (all roles)
          </p>
          {renderList(eventDocs)}
        </div>
      ) : null}

      {roleDocs.length > 0 ? (
        <div className={eventDocs.length > 0 ? "mt-4" : "mt-3"}>
          {eventDocs.length > 0 ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-ht-muted">
              This role only
            </p>
          ) : null}
          {renderList(roleDocs)}
        </div>
      ) : null}

      <p className="mt-3 text-xs text-ht-muted">
        Upload each file under{" "}
        <Link href="/network/freelancer/documents" className="text-ht-gold hover:text-ht-gold-bright">
          Documents → Other documents
        </Link>{" "}
        using the <strong>exact name</strong> shown above.
      </p>
    </div>
  );
}
