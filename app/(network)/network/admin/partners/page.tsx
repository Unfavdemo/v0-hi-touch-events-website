import Link from "next/link";
import { AdminHeader } from "@/components/network/admin/AdminHeader";
import { Badge, statusBadgeVariant } from "@/components/network/ui/Badge";
import { Button } from "@/components/network/ui/Button";
import { reinstateUser, suspendUser } from "@/lib/network/admin-actions";
import { requireSuperAdmin } from "@/lib/network/admin-rbac";
import { label } from "@/lib/network/labels";
import { prisma } from "@/lib/network/prisma";
import { isVendorPaid } from "@/lib/network/vendor-pay";

export default async function AdminPartnersPage() {
  await requireSuperAdmin();
  const partners = await prisma.user.findMany({
    where: { role: "PARTNER" },
    include: {
      profile: true,
      jobsPosted: {
        select: {
          status: true,
          vendorPaidAt: true,
          assignedFreelancerId: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <AdminHeader title="Partners">Organizations that post opportunities on the network.</AdminHeader>

      <div className="overflow-x-auto border-2 border-ht-line">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b-2 border-ht-line bg-ht-panel">
            <tr>
              <th className="ht-label px-4 py-3 text-ht-muted">Organization</th>
              <th className="ht-label px-4 py-3 text-ht-muted">Account</th>
              <th className="ht-label px-4 py-3 text-ht-muted">Open opportunities</th>
              <th className="ht-label px-4 py-3 text-ht-muted">Completed</th>
              <th className="ht-label px-4 py-3 text-ht-muted">Unpaid</th>
              <th className="ht-label px-4 py-3 text-ht-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((p) => {
              const open = p.jobsPosted.filter(
                (j) => j.status === "ACTIVE" || j.status === "FILLED" || j.status === "PENDING_APPROVAL",
              ).length;
              const completed = p.jobsPosted.filter((j) => j.status === "COMPLETED").length;
              const unpaid = p.jobsPosted.filter(
                (j) =>
                  j.assignedFreelancerId &&
                  (j.status === "FILLED" || j.status === "COMPLETED") &&
                  !isVendorPaid(j),
              ).length;
              return (
                <tr key={p.id} className="border-b border-ht-line last:border-b-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/network/admin/members/${p.id}`}
                      className="font-medium text-ht-cream hover:text-ht-gold"
                    >
                      {p.profile?.companyName ?? p.profile?.name ?? p.email}
                    </Link>
                    <p className="text-xs text-ht-muted">{p.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusBadgeVariant(p.status)}>{label(p.status)}</Badge>
                  </td>
                  <td className="px-4 py-3 text-ht-muted">{open}</td>
                  <td className="px-4 py-3 text-ht-muted">{completed}</td>
                  <td className="px-4 py-3 text-ht-muted">{unpaid}</td>
                  <td className="px-4 py-3">
                    {p.status === "SUSPENDED" ? (
                      <form action={reinstateUser.bind(null, p.id)}>
                        <Button type="submit" size="sm" variant="outline">
                          Reinstate
                        </Button>
                      </form>
                    ) : p.status === "APPROVED" ? (
                      <form action={suspendUser.bind(null, p.id)}>
                        <Button type="submit" size="sm" variant="danger">
                          Suspend
                        </Button>
                      </form>
                    ) : (
                      <span className="text-xs text-ht-muted">Awaiting approval</span>
                    )}
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
