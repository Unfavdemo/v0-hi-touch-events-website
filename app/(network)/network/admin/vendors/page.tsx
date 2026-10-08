import Link from "next/link";
import { AdminHeader } from "@/components/network/admin/AdminHeader";
import { DismissalFlagTip } from "@/components/network/help/Tips";
import { RatingStars } from "@/components/network/RatingStars";
import { Badge, statusBadgeVariant } from "@/components/network/ui/Badge";
import { Button } from "@/components/network/ui/Button";
import { reinstateUser, suspendUser } from "@/lib/network/admin-actions";
import { requireSuperAdmin } from "@/lib/network/admin-rbac";
import { label } from "@/lib/network/labels";
import { paperworkLabel, vendorPaperworkComplete } from "@/lib/network/paperwork";
import { prisma } from "@/lib/network/prisma";

export default async function AdminVendorsPage() {
  await requireSuperAdmin();
  const vendors = await prisma.user.findMany({
    where: { role: "FREELANCER" },
    include: {
      profile: { include: { categoryTags: true } },
      membership: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <AdminHeader title="Vendors">
        <span className="inline-flex items-center gap-2">
          Everyone who staffs opportunities — paperwork, plan, and rating.
          <DismissalFlagTip />
        </span>
      </AdminHeader>

      <div className="overflow-x-auto border-2 border-ht-line">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b-2 border-ht-line bg-ht-panel">
            <tr>
              <th className="ht-label px-4 py-3 text-ht-muted">Vendor</th>
              <th className="ht-label px-4 py-3 text-ht-muted">Skills</th>
              <th className="ht-label px-4 py-3 text-ht-muted">Account</th>
              <th className="ht-label px-4 py-3 text-ht-muted">Plan</th>
              <th className="ht-label px-4 py-3 text-ht-muted">Paperwork</th>
              <th className="ht-label px-4 py-3 text-ht-muted">Rating</th>
              <th className="ht-label px-4 py-3 text-ht-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((m) => (
              <tr key={m.id} className="border-b border-ht-line last:border-b-0">
                <td className="px-4 py-3">
                  <div className="font-medium text-ht-cream">
                    <Link href={`/network/admin/members/${m.id}`} className="hover:text-ht-gold">
                      {m.profile?.name ?? m.email}
                    </Link>
                    {m.profile?.flaggedForDismissal ? (
                      <Badge variant="danger" className="ml-2">
                        Flagged
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-xs text-ht-muted">
                    {m.email}
                    {m.profile?.companyName ? ` · ${m.profile.companyName}` : ""}
                  </p>
                </td>
                <td className="px-4 py-3 text-ht-muted">
                  {m.profile?.categoryTags.map((t) => t.name).join(", ") || "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusBadgeVariant(m.status)}>{label(m.status)}</Badge>
                </td>
                <td className="px-4 py-3 text-ht-muted">
                  {m.membership
                    ? `${label(m.membership.tier)} · ${label(m.membership.status)}`
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={vendorPaperworkComplete(m.profile) ? "gold" : "danger"}>
                    {paperworkLabel(m.profile)}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <RatingStars
                    value={m.profile?.ratingAvg ?? null}
                    count={m.profile?.ratingCount}
                  />
                </td>
                <td className="px-4 py-3">
                  {m.status === "SUSPENDED" ? (
                    <form action={reinstateUser.bind(null, m.id)}>
                      <Button type="submit" size="sm" variant="outline">
                        Reinstate
                      </Button>
                    </form>
                  ) : m.status === "APPROVED" ? (
                    <form action={suspendUser.bind(null, m.id)}>
                      <Button type="submit" size="sm" variant="danger">
                        Suspend
                      </Button>
                    </form>
                  ) : (
                    <span className="text-xs text-ht-muted">Awaiting approval</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
