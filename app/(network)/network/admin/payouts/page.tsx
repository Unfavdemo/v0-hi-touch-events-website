import Link from "next/link";
import { AdminHeader } from "@/components/network/admin/AdminHeader";
import { MarkVendorPaidForm } from "@/components/network/MarkVendorPaidForm";
import { Badge } from "@/components/network/ui/Badge";
import { Button } from "@/components/network/ui/Button";
import { adminJobsWhere } from "@/lib/network/admin-rbac";
import { requireUser } from "@/lib/network/auth";
import { label } from "@/lib/network/labels";
import { clearVendorPaid } from "@/lib/network/partner-payment-actions";
import { prisma } from "@/lib/network/prisma";
import { formatDate, formatMoney } from "@/lib/network/utils";
import { hiredPayAmount, isVendorPaid } from "@/lib/network/vendor-pay";

export default async function AdminPayoutsPage() {
  const admin = await requireUser("ADMIN");
  const jobs = await prisma.jobOpportunity.findMany({
    where: {
      ...adminJobsWhere(admin),
      assignedFreelancerId: { not: null },
      status: { in: ["FILLED", "COMPLETED"] },
    },
    include: {
      categoryTag: true,
      postedBy: { include: { profile: true } },
      assignedFreelancer: { include: { profile: true } },
      bids: { where: { status: "ACCEPTED" } },
    },
    orderBy: { eventStartTime: "desc" },
  });

  const due = jobs.filter((j) => !isVendorPaid(j));
  const paid = jobs.filter((j) => isVendorPaid(j));
  const dueTotal = due.reduce((sum, j) => sum + Number(hiredPayAmount(j)), 0);
  const paidTotal = paid.reduce(
    (sum, j) => sum + Number(j.vendorPaidAmount ?? hiredPayAmount(j)),
    0,
  );

  const byMonth = new Map<string, { due: number; paid: number }>();
  for (const job of jobs) {
    const key = `${job.eventStartTime.getFullYear()}-${String(job.eventStartTime.getMonth() + 1).padStart(2, "0")}`;
    const row = byMonth.get(key) ?? { due: 0, paid: 0 };
    const amount = Number(job.vendorPaidAmount ?? hiredPayAmount(job));
    if (isVendorPaid(job)) row.paid += amount;
    else row.due += Number(hiredPayAmount(job));
    byMonth.set(key, row);
  }

  return (
    <div className="space-y-10">
      <AdminHeader title="Payouts">
        Off-platform vendor pay that partners (or you) marked in HiTouch.
        <a href="/network/admin/payouts/export" className="ml-3 ht-label text-ht-gold hover:text-ht-gold-bright">
          Download CSV
        </a>
      </AdminHeader>

      <section className="grid gap-5 sm:grid-cols-2">
        <div className="border-2 border-ht-line bg-ht-panel p-5">
          <h2 className="ht-label text-ht-muted">Still to pay</h2>
          <p className="mt-3 text-2xl font-bold text-ht-gold">{formatMoney(dueTotal)}</p>
          <p className="mt-1 text-sm text-ht-muted">
            {due.length} vendor{due.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="border-2 border-ht-line bg-ht-panel p-5">
          <h2 className="ht-label text-ht-muted">Marked paid</h2>
          <p className="mt-3 text-2xl font-bold text-ht-cream">{formatMoney(paidTotal)}</p>
          <p className="mt-1 text-sm text-ht-muted">
            {paid.length} vendor{paid.length === 1 ? "" : "s"}
          </p>
        </div>
      </section>

      {byMonth.size > 0 ? (
        <section>
          <h2 className="ht-label text-ht-muted">By month</h2>
          <ul className="mt-3 divide-y-2 divide-ht-line border-2 border-ht-line bg-ht-panel">
            {[...byMonth.entries()].map(([month, row]) => (
              <li key={month} className="flex flex-wrap justify-between gap-3 px-4 py-3 text-sm">
                <span className="text-ht-cream">{month}</span>
                <span className="text-ht-muted">
                  Due {formatMoney(row.due)} · Paid {formatMoney(row.paid)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <h2 className="ht-label text-ht-muted">Need to pay ({due.length})</h2>
        {due.length === 0 ? (
          <p className="mt-4 border-2 border-dashed border-ht-line px-5 py-8 text-center text-sm text-ht-muted">
            No unpaid hired vendors in this list.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {due.map((job) => {
              const vendor = job.assignedFreelancer!;
              const amount = hiredPayAmount(job);
              const org =
                job.postedBy.profile?.companyName ??
                job.postedBy.profile?.name ??
                job.postedBy.email;
              return (
                <li key={job.id} className="border-2 border-ht-line bg-ht-panel p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Link
                        href={`/network/admin/jobs/${job.id}`}
                        className="font-semibold text-ht-cream hover:text-ht-gold"
                      >
                        {job.title}
                      </Link>
                      <p className="mt-1 text-sm text-ht-muted">
                        {vendor.profile?.name ?? vendor.email} · {org} ·{" "}
                        {formatDate(job.eventStartTime)}
                      </p>
                      <div className="mt-4">
                        <MarkVendorPaidForm jobId={job.id} amount={amount} />
                      </div>
                    </div>
                    <p className="text-xl font-bold text-ht-gold">{formatMoney(amount)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="ht-label text-ht-muted">Paid ({paid.length})</h2>
        {paid.length === 0 ? (
          <p className="mt-4 text-sm text-ht-muted">Nothing marked paid yet.</p>
        ) : (
          <ul className="mt-4 divide-y-2 divide-ht-line border-2 border-ht-line bg-ht-panel">
            {paid.map((job) => {
              const amount = job.vendorPaidAmount ?? hiredPayAmount(job);
              return (
                <li
                  key={job.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                >
                  <div>
                    <Link
                      href={`/network/admin/jobs/${job.id}`}
                      className="font-semibold text-ht-cream hover:text-ht-gold"
                    >
                      {job.title}
                    </Link>
                    <p className="mt-1 text-sm text-ht-muted">
                      {job.assignedFreelancer?.profile?.name ?? job.assignedFreelancer?.email}
                      {job.vendorPaidAt ? ` · ${formatDate(job.vendorPaidAt)}` : ""}
                      {job.vendorPayMethod ? ` · ${label(job.vendorPayMethod)}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-semibold text-ht-gold">
                      {formatMoney(amount.toString())}
                    </span>
                    <Badge variant="gold">Paid</Badge>
                    <form action={clearVendorPaid.bind(null, job.id)}>
                      <Button type="submit" size="sm" variant="ghost">
                        Not paid
                      </Button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
