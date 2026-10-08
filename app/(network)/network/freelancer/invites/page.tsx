import Link from "next/link";
import { JobCard } from "@/components/network/JobCard";
import { VendorRequiredDocsNotice } from "@/components/network/VendorRequiredDocsNotice";
import { VendorInvitesTip } from "@/components/network/help/Tips";
import { Badge } from "@/components/network/ui/Badge";
import { Button } from "@/components/network/ui/Button";
import { requireUser } from "@/lib/network/auth";
import { declineInvite } from "@/lib/network/jobs";
import { matchReasonsFromJson } from "@/lib/network/matching";
import { clientRequiredDocsByJobIds } from "@/lib/network/document-requirements";
import { prisma } from "@/lib/network/prisma";
import { formatDate } from "@/lib/network/utils";

const STATUS_LABEL = {
  PENDING: "Awaiting your reply",
  APPLIED: "Applied",
  DECLINED: "Declined",
  WITHDRAWN: "Closed",
} as const;

export default async function FreelancerInvitesPage() {
  const user = await requireUser("FREELANCER");

  const invites = await prisma.jobInvite.findMany({
    where: { freelancerId: user.id },
    include: {
      job: {
        include: { categoryTag: true, postedBy: { include: { profile: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  const open = invites.filter((i) => i.status === "PENDING" && i.job.status === "ACTIVE");
  const past = invites.filter((i) => !open.includes(i));
  const docByJob = await clientRequiredDocsByJobIds(open.map((i) => i.job.id));

  return (
    <div className="space-y-10">
      <header>
        <p className="ht-label text-ht-gold">Vendor</p>
        <h1 className="mt-1 inline-flex flex-wrap items-center gap-2 text-3xl font-bold text-ht-cream">
          Opportunity invites
          <VendorInvitesTip />
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ht-muted">
          HiTouch Solutions matches you to opportunities based on your categories, ratings,
          availability, and track record. An invite means you&apos;re on the shortlist — the
          partner still picks from everyone who applies.
        </p>
      </header>

      <section>
        <h2 className="ht-label text-ht-muted">Open invites ({open.length})</h2>
        {open.length === 0 ? (
          <p className="mt-4 border-2 border-ht-line bg-ht-panel px-5 py-8 text-center text-sm text-ht-muted">
            No open invites right now. Keep your profile, categories, and ratings strong to
            rank higher in matches.
          </p>
        ) : (
          <ul className="mt-4 space-y-5">
            {open.map((inv) => (
              <li
                key={inv.id}
                className="grid gap-5 border-2 border-ht-blue bg-ht-panel p-5 lg:grid-cols-[340px_1fr]"
              >
                <JobCard
                  job={inv.job}
                  href={`/network/freelancer/jobs/${inv.jobId}`}
                  extraRequiredDocs={docByJob.get(inv.job.id)?.map((d) => d.label)}
                />
                <div className="flex flex-col">
                  {(docByJob.get(inv.job.id)?.length ?? 0) > 0 ? (
                    <div className="mb-4 lg:hidden">
                      <VendorRequiredDocsNotice
                        clientDocs={docByJob.get(inv.job.id) ?? []}
                        compact
                      />
                    </div>
                  ) : null}
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="gold">
                      {inv.source === "PARTNER" ? "Hand-picked by the partner" : "Recommended by HiTouch"}
                    </Badge>
                    <span className="text-xs text-ht-muted">Invited {formatDate(inv.createdAt)}</span>
                  </div>
                  <p className="mt-3 text-lg font-semibold text-ht-cream">
                    {inv.job.postedBy.profile?.companyName ?? inv.job.postedBy.profile?.name ?? "Partner"}
                  </p>
                  <p className="ht-label mt-4 text-ht-muted">Why you were matched</p>
                  <ul className="mt-2 space-y-1 text-sm text-ht-cream">
                    {matchReasonsFromJson(inv.matchReasons).map((r) => (
                      <li key={r}>· {r}</li>
                    ))}
                  </ul>
                  <div className="mt-auto flex flex-wrap gap-3 pt-5">
                    <Link
                      href={`/network/freelancer/jobs/${inv.jobId}#apply`}
                      className="ht-label inline-flex items-center border-2 border-ht-blue bg-ht-blue px-5 py-2.5 font-semibold text-white hover:bg-ht-gold-bright"
                    >
                      Apply
                    </Link>
                    <form action={declineInvite.bind(null, inv.id)}>
                      <Button type="submit" variant="danger">
                        Decline
                      </Button>
                    </form>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {past.length > 0 ? (
        <section>
          <h2 className="ht-label text-ht-muted">Past invites ({past.length})</h2>
          <ul className="mt-4 divide-y-2 divide-ht-line border-2 border-ht-line bg-ht-panel">
            {past.map((inv) => (
              <li key={inv.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <Link
                  href={`/network/freelancer/jobs/${inv.jobId}`}
                  className="font-semibold text-ht-cream hover:text-ht-gold"
                >
                  {inv.job.title}
                </Link>
                <Badge variant={inv.status === "APPLIED" ? "gold" : inv.status === "DECLINED" ? "danger" : "muted"}>
                  {inv.status === "PENDING" ? "Closed" : STATUS_LABEL[inv.status]}
                </Badge>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
