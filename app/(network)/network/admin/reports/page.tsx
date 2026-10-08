import { AdminHeader } from "@/components/network/admin/AdminHeader";
import { requireSuperAdmin } from "@/lib/network/admin-rbac";
import { prisma } from "@/lib/network/prisma";
import { formatMoney } from "@/lib/network/utils";
import { hiredPayAmount } from "@/lib/network/vendor-pay";

export default async function AdminReportsPage() {
  await requireSuperAdmin();
  const [jobs, vendors, partners] = await Promise.all([
    prisma.jobOpportunity.findMany({
      include: {
        categoryTag: true,
        postedBy: { include: { profile: true } },
        assignedFreelancer: { include: { profile: true } },
        bids: { where: { status: "ACCEPTED" } },
      },
    }),
    prisma.user.count({ where: { role: "FREELANCER" } }),
    prisma.user.count({ where: { role: "PARTNER" } }),
  ]);

  const fillable = jobs.filter((j) => j.status !== "DRAFT" && j.status !== "PENDING_APPROVAL");
  const filled = jobs.filter((j) => j.status === "FILLED" || j.status === "COMPLETED");
  const fillRate = fillable.length === 0 ? 0 : Math.round((filled.length / fillable.length) * 100);

  const times = filled
    .map((j) => j.updatedAt.getTime() - j.createdAt.getTime())
    .filter((ms) => ms > 0);
  const avgFillHours =
    times.length === 0 ? null : Math.round(times.reduce((a, b) => a + b, 0) / times.length / 36e5);

  const booked = filled.reduce((sum, j) => sum + Number(hiredPayAmount(j)), 0);
  const paid = jobs.reduce(
    (sum, j) => sum + (j.vendorPaidAmount ? Number(j.vendorPaidAmount) : 0),
    0,
  );

  const byCategory = new Map<string, { total: number; filled: number }>();
  for (const job of fillable) {
    const row = byCategory.get(job.categoryTag.name) ?? { total: 0, filled: 0 };
    row.total += 1;
    if (job.status === "FILLED" || job.status === "COMPLETED") row.filled += 1;
    byCategory.set(job.categoryTag.name, row);
  }

  const vendorCounts = new Map<string, { name: string; n: number }>();
  for (const job of filled) {
    if (!job.assignedFreelancer) continue;
    const id = job.assignedFreelancer.id;
    const row = vendorCounts.get(id) ?? {
      name: job.assignedFreelancer.profile?.name ?? job.assignedFreelancer.email,
      n: 0,
    };
    row.n += 1;
    vendorCounts.set(id, row);
  }
  const topVendors = [...vendorCounts.values()].sort((a, b) => b.n - a.n).slice(0, 5);

  const partnerCounts = new Map<string, { name: string; n: number }>();
  for (const job of jobs) {
    const id = job.postedById;
    const row = partnerCounts.get(id) ?? {
      name: job.postedBy.profile?.companyName ?? job.postedBy.profile?.name ?? job.postedBy.email,
      n: 0,
    };
    row.n += 1;
    partnerCounts.set(id, row);
  }
  const topPartners = [...partnerCounts.values()].sort((a, b) => b.n - a.n).slice(0, 5);

  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);
  const signups = await prisma.user.count({
    where: { role: { not: "ADMIN" }, createdAt: { gte: monthAgo } },
  });

  return (
    <div className="space-y-10">
      <AdminHeader title="Reports">Fill rate, payouts vs booked pay, and who keeps coming back.</AdminHeader>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Fill rate" value={`${fillRate}%`} hint={`${filled.length} of ${fillable.length} live opportunities`} />
        <Stat
          label="Time to fill"
          value={avgFillHours == null ? "—" : `${avgFillHours}h`}
          hint="Average from post to filled"
        />
        <Stat label="Booked pay" value={formatMoney(booked)} hint="Accepted quotes on filled opportunities" />
        <Stat label="Recorded payouts" value={formatMoney(paid)} hint="Marked paid in HiTouch" />
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Stat label="Vendors" value={String(vendors)} />
        <Stat label="Partners" value={String(partners)} />
        <Stat label="Signups (30 days)" value={String(signups)} />
      </section>

      <section>
        <h2 className="ht-label text-ht-muted">Fill rate by category</h2>
        <ul className="mt-3 divide-y-2 divide-ht-line border-2 border-ht-line bg-ht-panel">
          {[...byCategory.entries()].map(([name, row]) => (
            <li key={name} className="flex justify-between px-4 py-3 text-sm">
              <span className="text-ht-cream">{name}</span>
              <span className="text-ht-muted">
                {row.filled}/{row.total} ({row.total === 0 ? 0 : Math.round((row.filled / row.total) * 100)}%)
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="ht-label text-ht-muted">Top vendors</h2>
          <ul className="mt-3 space-y-2 text-sm text-ht-cream">
            {topVendors.map((v) => (
              <li key={v.name}>
                {v.name} · {v.n}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="ht-label text-ht-muted">Top partners</h2>
          <ul className="mt-3 space-y-2 text-sm text-ht-cream">
            {topPartners.map((p) => (
              <li key={p.name}>
                {p.name} · {p.n}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="border-2 border-ht-line bg-ht-panel p-5">
      <p className="ht-label text-ht-muted">{label}</p>
      <p className="mt-2 text-2xl font-bold text-ht-cream">{value}</p>
      {hint ? <p className="mt-1 text-xs text-ht-muted">{hint}</p> : null}
    </div>
  );
}
