import Link from "next/link";
import { AdminHeader } from "@/components/network/admin/AdminHeader";
import { requireSuperAdmin } from "@/lib/network/admin-rbac";
import { prisma } from "@/lib/network/prisma";

export default async function AdminDocumentsIndexPage() {
  await requireSuperAdmin();

  const vendors = await prisma.user.findMany({
    where: { role: "FREELANCER" },
    include: {
      profile: true,
      vendorDocuments: { orderBy: { updatedAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <AdminHeader title="Documents">
        W-9s, certificates of insurance, and other files vendors keep on file. Partners never
        see this list — they can only open a W-9 after they hire that vendor. Use{" "}
        <em>Compliance</em> for expirations and missing paperwork.
      </AdminHeader>

      <div className="overflow-x-auto border-2 border-ht-line">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b-2 border-ht-line bg-ht-panel">
            <tr>
              <th className="ht-label px-4 py-3 text-ht-muted">Vendor</th>
              <th className="ht-label px-4 py-3 text-ht-muted">W-9</th>
              <th className="ht-label px-4 py-3 text-ht-muted">COI</th>
              <th className="ht-label px-4 py-3 text-ht-muted">Other</th>
              <th className="ht-label px-4 py-3 text-ht-muted">Files</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((v) => {
              const w9 = v.vendorDocuments.find((d) => d.kind === "W9");
              const coi = v.vendorDocuments.find((d) => d.kind === "COI");
              const otherCount = v.vendorDocuments.filter((d) => d.kind === "OTHER").length;
              return (
                <tr key={v.id} className="border-b border-ht-line last:border-b-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ht-cream">
                      {v.profile?.name ?? v.email}
                    </p>
                    <p className="text-xs text-ht-muted">{v.email}</p>
                  </td>
                  <td className="px-4 py-3 text-ht-muted">{w9 ? "On file" : "Missing"}</td>
                  <td className="px-4 py-3 text-ht-muted">
                    {coi
                      ? coi.expiresAt
                        ? `On file · expires ${coi.expiresAt.toLocaleDateString("en-US")}`
                        : "On file"
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-ht-muted">{otherCount || "—"}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/network/admin/documents/${v.id}`}
                      className="ht-label text-ht-gold hover:text-ht-gold-bright"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
