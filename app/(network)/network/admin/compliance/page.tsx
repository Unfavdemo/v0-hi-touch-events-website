import Link from "next/link";
import { AdminHeader } from "@/components/network/admin/AdminHeader";
import { Badge } from "@/components/network/ui/Badge";
import { requireSuperAdmin } from "@/lib/network/admin-rbac";
import { paperworkLabel, vendorPaperworkComplete } from "@/lib/network/paperwork";
import { prisma } from "@/lib/network/prisma";
import { formatDate } from "@/lib/network/utils";
import { VENDOR_AGREEMENT_VERSION } from "@/lib/network/vendor-agreement";

export default async function AdminCompliancePage() {
  await requireSuperAdmin();
  const soon = new Date();
  soon.setDate(soon.getDate() + 30);

  const vendors = await prisma.user.findMany({
    where: { role: "FREELANCER" },
    include: {
      profile: true,
      vendorDocuments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const missingPaper = vendors.filter((v) => !vendorPaperworkComplete(v.profile));
  const missingCoi = vendors.filter((v) => !v.vendorDocuments.some((d) => d.kind === "COI"));
  const expiringCoi = vendors.flatMap((v) =>
    v.vendorDocuments
      .filter((d) => d.kind === "COI" && d.expiresAt && d.expiresAt <= soon)
      .map((d) => ({ vendor: v, doc: d })),
  );
  const staleAgreement = vendors.filter(
    (v) =>
      v.profile?.vendorAgreementAcceptedAt &&
      v.profile.vendorAgreementVersion !== VENDOR_AGREEMENT_VERSION,
  );

  return (
    <div className="space-y-10">
      <AdminHeader title="Compliance">
        W-9, current vendor agreement, and certificates of insurance. File library stays under
        Documents.
      </AdminHeader>

      <section>
        <h2 className="ht-label text-ht-muted">Missing W-9 or agreement ({missingPaper.length})</h2>
        {missingPaper.length === 0 ? (
          <p className="mt-3 text-sm text-ht-muted">Every vendor has current paperwork.</p>
        ) : (
          <ul className="mt-3 divide-y-2 divide-ht-line border-2 border-ht-line bg-ht-panel">
            {missingPaper.map((v) => (
              <li key={v.id} className="flex flex-wrap justify-between gap-3 px-4 py-3 text-sm">
                <Link href={`/network/admin/members/${v.id}`} className="text-ht-cream hover:text-ht-gold">
                  {v.profile?.name ?? v.email}
                </Link>
                <Badge variant="danger">{paperworkLabel(v.profile)}</Badge>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="ht-label text-ht-muted">
          COI expiring within 30 days ({expiringCoi.length})
        </h2>
        {expiringCoi.length === 0 ? (
          <p className="mt-3 text-sm text-ht-muted">No certificates expiring soon.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {expiringCoi.map(({ vendor, doc }) => (
              <li key={doc.id} className="border-2 border-ht-line bg-ht-panel px-4 py-3 text-sm">
                <Link
                  href={`/network/admin/documents/${vendor.id}`}
                  className="text-ht-cream hover:text-ht-gold"
                >
                  {vendor.profile?.name ?? vendor.email}
                </Link>
                <span className="text-ht-muted">
                  {" "}
                  · expires {doc.expiresAt ? formatDate(doc.expiresAt) : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="ht-label text-ht-muted">Missing COI ({missingCoi.length})</h2>
        {missingCoi.length === 0 ? (
          <p className="mt-3 text-sm text-ht-muted">Every vendor has a certificate on file.</p>
        ) : (
          <ul className="mt-3 text-sm text-ht-muted">
            {missingCoi.map((v) => (
              <li key={v.id}>
                <Link href={`/network/admin/documents/${v.id}`} className="text-ht-cream hover:text-ht-gold">
                  {v.profile?.name ?? v.email}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="ht-label text-ht-muted">
          Stale vendor agreement ({staleAgreement.length})
        </h2>
        <p className="mt-1 text-xs text-ht-muted">Current version {VENDOR_AGREEMENT_VERSION}</p>
        {staleAgreement.length === 0 ? (
          <p className="mt-3 text-sm text-ht-muted">Everyone is on the current agreement.</p>
        ) : (
          <ul className="mt-3 text-sm text-ht-muted">
            {staleAgreement.map((v) => (
              <li key={v.id}>{v.profile?.name ?? v.email}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
