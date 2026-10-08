import Link from "next/link";
import { ApplicationStatusTip } from "@/components/network/help/Tips";
import { applicationStatusLabel, Badge, statusBadgeVariant } from "@/components/network/ui/Badge";
import { requireUser } from "@/lib/network/auth";
import { prisma } from "@/lib/network/prisma";
import { formatDateTime, formatMoney } from "@/lib/network/utils";

export default async function FreelancerBidsPage() {
  const user = await requireUser("FREELANCER");

  const bids = await prisma.bidProposal.findMany({
    where: { freelancerId: user.id },
    include: { job: { include: { categoryTag: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <header>
        <p className="ht-label text-ht-gold">Vendor</p>
        <h1 className="mt-1 inline-flex flex-wrap items-center gap-2 text-3xl font-bold text-ht-cream">
          My applications
          <ApplicationStatusTip />
        </h1>
      </header>

      {bids.length === 0 ? (
        <p className="border-2 border-ht-line bg-ht-panel px-5 py-8 text-center text-sm text-ht-muted">
          You haven&apos;t applied to anything yet.{" "}
          <Link href="/network/freelancer/invites" className="text-ht-gold hover:text-ht-gold-bright">
            Check your invites →
          </Link>
        </p>
      ) : (
        <ul className="space-y-3">
          {bids.map((bid) => (
            <li key={bid.id} className="border-2 border-ht-line bg-ht-panel p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <Link
                    href={`/network/freelancer/jobs/${bid.jobId}`}
                    className="font-semibold text-ht-cream hover:text-ht-gold"
                  >
                    {bid.job.title}
                  </Link>
                  <p className="mt-1 text-sm text-ht-muted">
                    {bid.job.categoryTag.name} · opportunity{" "}
                    {formatDateTime(bid.job.eventStartTime)}
                  </p>
                  {bid.notes ? (
                    <p className="mt-2 text-sm text-ht-muted">{bid.notes}</p>
                  ) : null}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-ht-gold">
                    {formatMoney(bid.amount.toString())}
                  </p>
                  <Badge className="mt-1" variant={statusBadgeVariant(bid.status)}>
                    {applicationStatusLabel(bid.status)}
                  </Badge>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
