import { PaymentsTip } from "@/components/network/help/Tips";
import { MarkVendorPaidForm } from "@/components/network/MarkVendorPaidForm";
import { VendorAvatar } from "@/components/network/VendorAvatar";
import { Badge } from "@/components/network/ui/Badge";
import { Button } from "@/components/network/ui/Button";
import { label } from "@/lib/network/labels";
import { requirePartnerOrg } from "@/lib/network/partner-org";
import { clearVendorPaid } from "@/lib/network/partner-payment-actions";
import { prisma } from "@/lib/network/prisma";
import { formatDate, formatMoney } from "@/lib/network/utils";
import { hiredPayAmount, isVendorPaid } from "@/lib/network/vendor-pay";
import Link from "next/link";

export default async function PartnerPaymentsPage() {
  const { ownerId } = await requirePartnerOrg();
  const jobs = await prisma.jobOpportunity.findMany({
    where: {
      postedById: ownerId,
      assignedFreelancerId: { not: null },
      status: { in: ["FILLED", "COMPLETED"] },
    },
    include: {
      categoryTag: true,
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

  return (
    <div className="space-y-10">
      <header>
        <p className="ht-label text-ht-blue-bright">Partner</p>
        <h1 className="mt-1 inline-flex flex-wrap items-center gap-2 text-3xl font-bold text-ht-cream">
          Payments
          <PaymentsTip partner />
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ht-muted">
          Pay hired vendors outside HiTouch — check, transfer, or card — then mark them paid
          here so you and the vendor both have a record. Year-end totals live on{" "}
          <Link href="/network/partner/reports" className="text-ht-gold hover:text-ht-gold-bright">
            Reports
          </Link>
          .
        </p>
      </header>

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

      <section>
        <h2 className="ht-label text-ht-muted">Need to pay ({due.length})</h2>
        {due.length === 0 ? (
          <p className="mt-4 border-2 border-ht-line bg-ht-panel px-5 py-8 text-center text-sm text-ht-muted">
            No unpaid vendors right now. Amounts show up here after you hire someone.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {due.map((job) => {
              const vendor = job.assignedFreelancer!;
              const profile = vendor.profile;
              const amount = hiredPayAmount(job);
              return (
                <li key={job.id} className="border-2 border-ht-line bg-ht-panel p-5">
                  <div className="flex flex-wrap items-start gap-4">
                    <VendorAvatar
                      name={profile?.name ?? vendor.email}
                      type={profile?.type ?? "INDIVIDUAL"}
                      headshotUrl={profile?.headshotUrl}
                      logoUrl={profile?.logoUrl}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/network/partner/jobs/${job.id}`}
                        className="font-semibold text-ht-cream hover:text-ht-gold"
                      >
                        {job.title}
                      </Link>
                      <p className="mt-1 text-sm text-ht-muted">
                        <Link href={`/network/${vendor.id}`} className="hover:text-ht-gold">
                          {profile?.name ?? vendor.email}
                        </Link>
                        {" · "}
                        {job.categoryTag.name}
                        {" · "}
                        {formatDate(job.eventStartTime)}
                      </p>
                      {profile?.mailingAddress ? (
                        <p className="mt-2 text-sm text-ht-muted">
                          Mail a check to {profile.mailingAddress}
                        </p>
                      ) : null}
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
              const vendor = job.assignedFreelancer!;
              const amount = job.vendorPaidAmount ?? hiredPayAmount(job);
              return (
                <li
                  key={job.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                >
                  <div>
                    <Link
                      href={`/network/partner/jobs/${job.id}`}
                      className="font-semibold text-ht-cream hover:text-ht-gold"
                    >
                      {job.title}
                    </Link>
                    <p className="mt-1 text-sm text-ht-muted">
                      {vendor.profile?.name ?? vendor.email}
                      {job.vendorPaidAt ? ` · ${formatDate(job.vendorPaidAt)}` : ""}
                      {job.vendorPayMethod ? ` · ${label(job.vendorPayMethod)}` : ""}
                    </p>
                    {job.vendorPayNote ? (
                      <p className="mt-1 text-sm text-ht-cream">{job.vendorPayNote}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-semibold text-ht-gold">{formatMoney(amount.toString())}</span>
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
