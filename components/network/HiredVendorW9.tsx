import { documentKindLabel, partnerHasHiredVendor } from "@/lib/network/document-access";
import { prisma } from "@/lib/network/prisma";
import { formatDate } from "@/lib/network/utils";
import type { VendorDocumentKind } from "@/lib/generated/network-prisma/client";

const PARTNER_KINDS: VendorDocumentKind[] = ["W9", "COI"];

export async function HiredVendorDocuments({
  partnerId,
  vendorId,
  vendorName,
}: {
  partnerId: string;
  vendorId: string;
  vendorName: string;
}) {
  const hired = await partnerHasHiredVendor(partnerId, vendorId);
  if (!hired) return null;

  const docs = await prisma.vendorDocument.findMany({
    where: { vendorId, kind: { in: PARTNER_KINDS } },
    orderBy: { updatedAt: "desc" },
  });
  const latest = PARTNER_KINDS.map((kind) => docs.find((d) => d.kind === kind) ?? null);

  return (
    <section className="border-2 border-ht-line bg-ht-panel p-5">
      <h2 className="ht-label text-ht-muted">Vendor documents</h2>
      <p className="mt-2 text-sm text-ht-muted">
        Because you hired {vendorName}, you can open their W-9 and certificate of insurance.
        Other files stay with HiTouch.
      </p>
      <ul className="mt-4 space-y-3">
        {latest.map((doc, i) => {
          const kind = PARTNER_KINDS[i];
          const name = documentKindLabel(kind);
          if (!doc) {
            return (
              <li key={kind} className="text-sm text-ht-muted">
                No {name} on file yet.
              </li>
            );
          }
          return (
            <li key={doc.id} className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-ht-cream">{name}</p>
                <p className="text-xs text-ht-muted">Updated {formatDate(doc.updatedAt)}</p>
              </div>
              <a
                href={`/api/vendor-documents/${doc.id}`}
                className="ht-label border-2 border-ht-gold px-4 py-2 text-ht-gold hover:bg-ht-gold hover:text-white"
                target="_blank"
                rel="noreferrer"
              >
                View
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
