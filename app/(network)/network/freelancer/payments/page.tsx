import Link from "next/link";
import { VendorHeader } from "@/components/network/freelancer/VendorHeader";
import { PaymentsTip } from "@/components/network/help/Tips";
import { Badge } from "@/components/network/ui/Badge";
import { requireUser } from "@/lib/network/auth";
import { getGustoClient } from "@/lib/network/gusto";
import { formatIsoDay, label } from "@/lib/network/labels";
import { prisma } from "@/lib/network/prisma";
import { formatDate, formatMoney } from "@/lib/network/utils";
import { hiredPayAmount, isVendorPaid } from "@/lib/network/vendor-pay";
import { buildVendorEarningsReport, yearBounds } from "@/lib/network/vendor-earnings";

function payoutBadgeVariant(state: string): "gold" | "blue" | "muted" | "danger" {
  switch (state) {
    case "PAID":
      return "gold";
    case "PROCESSING":
      return "blue";
    case "ON_HOLD":
      return "danger";
    default:
      return "muted";
  }
}

export default async function FreelancerPaymentsPage() {
  const user = await requireUser("FREELANCER");
  const gusto = getGustoClient();

  const [status, disbursements, history, jobs] = await Promise.all([
    gusto.getPayoutStatus(user.id),
    gusto.getUpcomingDisbursements(user.id),
    gusto.getWageHistory(user.id),
    prisma.jobOpportunity.findMany({
      where: {
        assignedFreelancerId: user.id,
        status: { in: ["FILLED", "COMPLETED"] },
      },
      include: {
        postedBy: { include: { profile: true } },
        categoryTag: true,
        bids: { where: { freelancerId: user.id, status: "ACCEPTED" } },
      },
      orderBy: { eventStartTime: "desc" },
    }),
  ]);

  const year = new Date().getFullYear();
  const { start, end } = yearBounds(year);
  const ytdReport = buildVendorEarningsReport(
    jobs.filter((j) => {
      const anchor = j.vendorPaidAt ?? j.eventStartTime;
      return anchor >= start && anchor < end;
    }),
    year,
  );

  return (
    <div className="space-y-10">
      <VendorHeader title="Payments" tip={<PaymentsTip />}>
        Partners mark you paid after each opportunity. This page also shows HiTouch payroll (Gusto)
        records when applicable.
      </VendorHeader>

      <section className="flex flex-wrap gap-6 border-2 border-ht-line bg-ht-panel px-5 py-4">
        <div>
          <p className="ht-label text-ht-muted">{year} paid to date</p>
          <p className="mt-1 text-xl font-bold text-ht-gold">{formatMoney(ytdReport.paidTotal)}</p>
        </div>
        {ytdReport.outstandingTotal > 0 ? (
          <div>
            <p className="ht-label text-ht-muted">{year} outstanding</p>
            <p className="mt-1 text-xl font-bold text-ht-cream">
              {formatMoney(ytdReport.outstandingTotal)}
            </p>
          </div>
        ) : null}
        <Link href="/network/freelancer/reports" className="ht-label text-ht-gold hover:text-ht-gold-bright">
          Full reports →
        </Link>
      </section>

      <section>
        <h2 className="ht-label text-ht-muted">Your opportunities</h2>
        {jobs.length === 0 ? (
          <p className="mt-4 border-2 border-ht-line bg-ht-panel px-5 py-8 text-center text-sm text-ht-muted">
            Payments show up here after a partner hires you.
          </p>
        ) : (
          <ul className="mt-4 divide-y-2 divide-ht-line border-2 border-ht-line bg-ht-panel">
            {jobs.map((job) => {
              const org =
                job.postedBy.profile?.companyName ??
                job.postedBy.profile?.name ??
                "Partner";
              const amount = job.vendorPaidAmount ?? hiredPayAmount(job);
              return (
                <li
                  key={job.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                >
                  <div>
                    <Link
                      href={`/network/freelancer/jobs/${job.id}`}
                      className="font-semibold text-ht-cream hover:text-ht-gold"
                    >
                      {job.title}
                    </Link>
                    <p className="mt-1 text-sm text-ht-muted">
                      {org}
                      {isVendorPaid(job) && job.vendorPaidAt
                        ? ` · ${formatDate(job.vendorPaidAt)}`
                        : ""}
                      {job.vendorPayMethod ? ` · ${label(job.vendorPayMethod)}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-ht-gold">
                      {formatMoney(amount.toString())}
                    </span>
                    <Badge variant={isVendorPaid(job) ? "gold" : "muted"}>
                      {isVendorPaid(job) ? "Paid" : "Awaiting pay"}
                    </Badge>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <div className="border-2 border-ht-line bg-ht-panel p-5">
        <h2 className="ht-label text-ht-muted">HiTouch payroll</h2>
          <div className="mt-3">
            <Badge variant={payoutBadgeVariant(status.state)}>{label(status.state)}</Badge>
          </div>
          <p className="mt-3 text-sm text-ht-muted">
            Paid by {label(status.payoutMethod).toLowerCase()}
          </p>
        </div>
        <div className="border-2 border-ht-line bg-ht-panel p-5">
          <h2 className="ht-label text-ht-muted">Last payment</h2>
          <p className="mt-3 text-2xl font-bold text-ht-gold">
            {status.lastPaymentAmount !== null
              ? formatMoney(status.lastPaymentAmount)
              : "—"}
          </p>
          <p className="mt-1 text-sm text-ht-muted">{formatIsoDay(status.lastPaymentDate)}</p>
        </div>
        <div className="border-2 border-ht-line bg-ht-panel p-5">
          <h2 className="ht-label text-ht-muted">Next payday</h2>
          <p className="mt-3 text-2xl font-bold text-ht-blue-bright">
            {formatIsoDay(status.nextPaymentDate)}
          </p>
        </div>
      </section>

      <section>
        <h2 className="ht-label text-ht-muted">Upcoming payments</h2>
        <div className="mt-4 overflow-x-auto border-2 border-ht-line">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b-2 border-ht-line bg-ht-panel">
              <tr>
                <th className="ht-label px-4 py-3 text-ht-muted">Expected</th>
                <th className="ht-label px-4 py-3 text-ht-muted">Opportunity</th>
                <th className="ht-label px-4 py-3 text-ht-muted">Amount</th>
                <th className="ht-label px-4 py-3 text-ht-muted">Status</th>
              </tr>
            </thead>
            <tbody>
              {disbursements.map((d) => (
                <tr key={d.id} className="border-b border-ht-line last:border-b-0">
                  <td className="px-4 py-3 whitespace-nowrap text-ht-cream">
                    {formatIsoDay(d.expectedDate)}
                  </td>
                  <td className="px-4 py-3 text-ht-muted">{d.jobTitle}</td>
                  <td className="px-4 py-3 font-semibold text-ht-gold">
                    {formatMoney(d.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={d.status === "PROCESSING" ? "blue" : "muted"}>
                      {label(d.status)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="ht-label text-ht-muted">Payment history</h2>
        <div className="mt-4 overflow-x-auto border-2 border-ht-line">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b-2 border-ht-line bg-ht-panel">
              <tr>
                <th className="ht-label px-4 py-3 text-ht-muted">Paid</th>
                <th className="ht-label px-4 py-3 text-ht-muted">Opportunity</th>
                <th className="ht-label px-4 py-3 text-ht-muted">Before taxes</th>
                <th className="ht-label px-4 py-3 text-ht-muted">Take-home</th>
                <th className="ht-label px-4 py-3 text-ht-muted">Method</th>
              </tr>
            </thead>
            <tbody>
              {history.map((p) => (
                <tr key={p.id} className="border-b border-ht-line last:border-b-0">
                  <td className="px-4 py-3 whitespace-nowrap text-ht-cream">
                    {formatIsoDay(p.paidAt)}
                  </td>
                  <td className="px-4 py-3 text-ht-muted">{p.jobTitle}</td>
                  <td className="px-4 py-3 text-ht-cream">{formatMoney(p.grossAmount)}</td>
                  <td className="px-4 py-3 font-semibold text-ht-gold">
                    {formatMoney(p.netAmount)}
                  </td>
                  <td className="px-4 py-3 text-ht-muted">
                    {label(p.method)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
