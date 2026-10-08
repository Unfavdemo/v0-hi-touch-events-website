import Link from "next/link";
import { AdminHeader } from "@/components/network/admin/AdminHeader";
import { Badge } from "@/components/network/ui/Badge";
import { requireSuperAdmin } from "@/lib/network/admin-rbac";
import { label } from "@/lib/network/labels";
import { stripeCustomerUrl } from "@/lib/network/payouts-csv";
import { prisma } from "@/lib/network/prisma";
import { formatDate } from "@/lib/network/utils";

export default async function AdminMembershipsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; tier?: string }>;
}) {
  await requireSuperAdmin();
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : undefined;
  const tier = typeof params.tier === "string" ? params.tier : undefined;

  const members = await prisma.membership.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(tier ? { tier: tier as never } : {}),
    },
    include: { user: { include: { profile: true } } },
    orderBy: { updatedAt: "desc" },
  });

  const filters = [
    { href: "/admin/memberships", label: "All" },
    { href: "/admin/memberships?status=PAST_DUE", label: "Overdue" },
    { href: "/admin/memberships?status=INCOMPLETE", label: "Not finished" },
    { href: "/admin/memberships?tier=BETA_FREE", label: "Free beta" },
  ];

  return (
    <div className="space-y-8">
      <AdminHeader title="Memberships">
        Vendor plans and billing status. Open a Stripe customer when an id is on file.
      </AdminHeader>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="ht-label border-2 border-ht-line px-3 py-1.5 text-ht-muted hover:border-ht-gold hover:text-ht-gold"
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto border-2 border-ht-line">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b-2 border-ht-line bg-ht-panel">
            <tr>
              <th className="ht-label px-4 py-3 text-ht-muted">Vendor</th>
              <th className="ht-label px-4 py-3 text-ht-muted">Plan</th>
              <th className="ht-label px-4 py-3 text-ht-muted">Status</th>
              <th className="ht-label px-4 py-3 text-ht-muted">Period end</th>
              <th className="ht-label px-4 py-3 text-ht-muted">Stripe</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b border-ht-line last:border-b-0">
                <td className="px-4 py-3">
                  <Link
                    href={`/network/admin/members/${m.userId}`}
                    className="font-medium text-ht-cream hover:text-ht-gold"
                  >
                    {m.user.profile?.name ?? m.user.email}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ht-muted">{label(m.tier)}</td>
                <td className="px-4 py-3">
                  <Badge variant={m.status === "PAST_DUE" ? "danger" : "muted"}>
                    {label(m.status)}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-ht-muted">
                  {m.currentPeriodEnd ? formatDate(m.currentPeriodEnd) : "—"}
                </td>
                <td className="px-4 py-3">
                  {m.stripeCustomerId ? (
                    <a
                      href={stripeCustomerUrl(m.stripeCustomerId)}
                      className="text-ht-gold hover:text-ht-gold-bright"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open customer
                    </a>
                  ) : (
                    <span className="text-ht-muted">—</span>
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
