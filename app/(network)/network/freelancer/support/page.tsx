import Link from "next/link";
import { VendorHeader } from "@/components/network/freelancer/VendorHeader";
import { VendorSupportTip } from "@/components/network/help/Tips";
import { label } from "@/lib/network/labels";
import { requireUser } from "@/lib/network/auth";
import { prisma } from "@/lib/network/prisma";
import { hiredPayAmount } from "@/lib/network/vendor-pay";
import { formatDate, formatMoney } from "@/lib/network/utils";

const SUPPORT_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@hitouch.io";

export default async function FreelancerSupportPage() {
  const user = await requireUser("FREELANCER");
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  const [incidents, unpaid] = await Promise.all([
    prisma.incident.findMany({
      where: { vendorId: user.id, voidedAt: null },
      include: { job: { select: { id: true, title: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.jobOpportunity.findMany({
      where: {
        assignedFreelancerId: user.id,
        status: "COMPLETED",
        vendorPaidAt: null,
        eventEndTime: { lt: cutoff },
      },
      include: { postedBy: { include: { profile: true } } },
      orderBy: { eventEndTime: "desc" },
    }),
  ]);

  return (
    <div className="space-y-10">
      <VendorHeader title="Support" tip={<VendorSupportTip />}>
        See what HiTouch logged on your account and chase partner payments that are still open.
      </VendorHeader>

      <section className="border-2 border-ht-line bg-ht-panel p-6">
        <h2 className="text-lg font-semibold text-ht-cream">Contact HiTouch</h2>
        <p className="mt-2 text-sm text-ht-muted">
          Email{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-ht-gold hover:text-ht-gold-bright">
            {SUPPORT_EMAIL}
          </a>{" "}
          with your opportunity name and partner if something isn&apos;t resolved in the portal.
        </p>
      </section>

      <section>
        <h2 className="ht-label text-ht-muted">Incidents on your account ({incidents.length})</h2>
        {incidents.length === 0 ? (
          <p className="mt-4 text-sm text-ht-muted">No incidents logged.</p>
        ) : (
          <ul className="mt-4 divide-y-2 divide-ht-line border-2 border-ht-line bg-ht-panel">
            {incidents.map((inc) => (
              <li key={inc.id} className="px-5 py-4">
                <p className="font-semibold text-ht-cream">{label(inc.kind)}</p>
                <p className="mt-1 text-sm text-ht-cream">{inc.notes}</p>
                <p className="mt-2 text-xs text-ht-muted">
                  {formatDate(inc.createdAt)}
                  {inc.job ? (
                    <>
                      {" "}
                      ·{" "}
                      <Link href={`/network/freelancer/jobs/${inc.job.id}`} className="text-ht-gold hover:text-ht-gold-bright">
                        {inc.job.title}
                      </Link>
                    </>
                  ) : null}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="ht-label text-ht-muted">Unpaid completed opportunities ({unpaid.length})</h2>
        <p className="mt-2 text-sm text-ht-muted">
          Completed more than 30 days ago with no payment marked by the partner.
        </p>
        {unpaid.length === 0 ? (
          <p className="mt-4 text-sm text-ht-muted">Nothing overdue right now.</p>
        ) : (
          <ul className="mt-4 divide-y-2 divide-ht-line border-2 border-ht-line bg-ht-panel">
            {unpaid.map((job) => {
              const org =
                job.postedBy.profile?.companyName ?? job.postedBy.profile?.name ?? "Partner";
              const amount = job.vendorPaidAmount ?? hiredPayAmount(job);
              return (
                <li key={job.id} className="flex flex-wrap justify-between gap-3 px-5 py-4">
                  <div>
                    <Link href={`/network/freelancer/jobs/${job.id}`} className="font-semibold text-ht-cream hover:text-ht-gold">
                      {job.title}
                    </Link>
                    <p className="mt-1 text-sm text-ht-muted">
                      {org} · ended {formatDate(job.eventEndTime)}
                    </p>
                  </div>
                  <p className="font-bold text-ht-gold">{formatMoney(amount.toString())}</p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
