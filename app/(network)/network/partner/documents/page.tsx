import Link from "next/link";
import { VendorAvatar } from "@/components/network/VendorAvatar";
import { documentKindLabel } from "@/lib/network/document-access";
import { requirePartnerOrg } from "@/lib/network/partner-org";
import { prisma } from "@/lib/network/prisma";
import { formatDate } from "@/lib/network/utils";
import type { VendorDocumentKind } from "@/lib/generated/network-prisma/client";

const PARTNER_KINDS: VendorDocumentKind[] = ["W9", "COI"];

export default async function PartnerDocumentsPage() {
  const { ownerId } = await requirePartnerOrg();
  const jobs = await prisma.jobOpportunity.findMany({
    where: {
      postedById: ownerId,
      assignedFreelancerId: { not: null },
      status: { in: ["FILLED", "COMPLETED"] },
    },
    include: {
      assignedFreelancer: {
        include: {
          profile: true,
          vendorDocuments: {
            where: { kind: { in: PARTNER_KINDS } },
            orderBy: { updatedAt: "desc" },
          },
        },
      },
    },
    orderBy: { eventStartTime: "desc" },
  });

  const byVendor = new Map<
    string,
    {
      vendorId: string;
      name: string;
      type: "INDIVIDUAL" | "BUSINESS";
      headshotUrl: string | null;
      logoUrl: string | null;
      events: { id: string; title: string }[];
      docs: { id: string; kind: VendorDocumentKind; updatedAt: Date }[];
    }
  >();

  for (const job of jobs) {
    const vendor = job.assignedFreelancer;
    if (!vendor) continue;
    const existing = byVendor.get(vendor.id);
    const event = { id: job.id, title: job.title };
    if (existing) {
      if (!existing.events.some((e) => e.id === job.id)) existing.events.push(event);
      continue;
    }
    const latest = PARTNER_KINDS.flatMap((kind) => {
      const doc = vendor.vendorDocuments.find((d) => d.kind === kind);
      return doc ? [{ id: doc.id, kind: doc.kind, updatedAt: doc.updatedAt }] : [];
    });
    byVendor.set(vendor.id, {
      vendorId: vendor.id,
      name: vendor.profile?.name ?? vendor.email,
      type: vendor.profile?.type ?? "INDIVIDUAL",
      headshotUrl: vendor.profile?.headshotUrl ?? null,
      logoUrl: vendor.profile?.logoUrl ?? null,
      events: [event],
      docs: latest,
    });
  }

  const vendors = [...byVendor.values()];

  return (
    <div className="space-y-8">
      <header>
        <p className="ht-label text-ht-blue-bright">Partner</p>
        <h1 className="mt-1 text-3xl font-bold text-ht-cream">Documents</h1>
        <p className="mt-2 max-w-2xl text-sm text-ht-muted">
          W-9s and certificates of insurance for vendors you have hired. You only see
          files after a hire — other vendor files stay with HiTouch.
        </p>
      </header>

      {vendors.length === 0 ? (
        <p className="border-2 border-ht-line bg-ht-panel px-5 py-8 text-center text-sm text-ht-muted">
          Documents appear here after you hire someone.
        </p>
      ) : (
        <ul className="space-y-6">
          {vendors.map((vendor) => (
            <li key={vendor.vendorId} className="border-2 border-ht-line bg-ht-panel p-5">
              <div className="flex flex-wrap items-start gap-4">
                <VendorAvatar
                  name={vendor.name}
                  type={vendor.type}
                  headshotUrl={vendor.headshotUrl}
                  logoUrl={vendor.logoUrl}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/network/${vendor.vendorId}`}
                    className="font-semibold text-ht-cream hover:text-ht-gold"
                  >
                    {vendor.name}
                  </Link>
                  <p className="mt-1 text-sm text-ht-muted">
                    Hired for{" "}
                    {vendor.events.map((jobLink, i) => (
                      <span key={jobLink.id}>
                        {i > 0 ? ", " : ""}
                        <Link href={`/network/partner/jobs/${jobLink.id}`} className="hover:text-ht-gold">
                          {jobLink.title}
                        </Link>
                      </span>
                    ))}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {PARTNER_KINDS.map((kind) => {
                      const doc = vendor.docs.find((d) => d.kind === kind);
                      const name = documentKindLabel(kind);
                      if (!doc) {
                        return (
                          <li key={kind} className="text-sm text-ht-muted">
                            No {name} on file yet.
                          </li>
                        );
                      }
                      return (
                        <li
                          key={doc.id}
                          className="flex flex-wrap items-center justify-between gap-3"
                        >
                          <span className="text-sm text-ht-cream">
                            {name}
                            <span className="ml-2 text-xs text-ht-muted">
                              Updated {formatDate(doc.updatedAt)}
                            </span>
                          </span>
                          <a
                            href={`/api/vendor-documents/${doc.id}`}
                            className="ht-label border-2 border-ht-gold px-3 py-1.5 text-ht-gold hover:bg-ht-gold hover:text-white"
                            target="_blank"
                            rel="noreferrer"
                          >
                            View
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
