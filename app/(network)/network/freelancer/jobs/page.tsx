import Link from "next/link";
import { JobCard } from "@/components/network/JobCard";
import { OpenBoardTip } from "@/components/network/help/Tips";
import { Badge } from "@/components/network/ui/Badge";
import { requireUser } from "@/lib/network/auth";
import { clientRequiredLabelsByJobIds } from "@/lib/network/document-requirements";
import { prisma } from "@/lib/network/prisma";

export default async function FreelancerJobBoardPage() {
  const user = await requireUser("FREELANCER");
  const tagIds = user.profile?.categoryTags.map((t) => t.id) ?? [];

  const jobs = await prisma.jobOpportunity.findMany({
    where: {
      status: "ACTIVE",
      postedById: { not: user.id },
      OR: [
        { isOpenBidding: true, categoryTagId: { in: tagIds } },
        { invites: { some: { freelancerId: user.id, status: "PENDING" } } },
      ],
    },
    include: {
      categoryTag: true,
      invites: { where: { freelancerId: user.id }, select: { status: true } },
    },
    orderBy: { eventStartTime: "asc" },
  });

  const docLabels = await clientRequiredLabelsByJobIds(jobs.map((j) => j.id));

  return (
    <div className="space-y-8">
      <header>
        <p className="ht-label text-ht-gold">Vendor</p>
        <h1 className="mt-1 inline-flex flex-wrap items-center gap-2 text-3xl font-bold text-ht-cream">
          Job board
          <OpenBoardTip />
        </h1>
        <p className="mt-2 flex flex-wrap items-center gap-1.5 text-sm text-ht-muted">
          Open opportunities in your skills:
          {(user.profile?.categoryTags ?? []).map((tag) => (
            <Badge key={tag.id} variant="blue">
              {tag.name}
            </Badge>
          ))}
        </p>
        <p className="mt-2 text-sm text-ht-muted">
          Most opportunities are invite-only.{" "}
          <Link href="/network/freelancer/invites" className="text-ht-gold hover:text-ht-gold-bright">
            Check your invites →
          </Link>
        </p>
      </header>

      {jobs.length === 0 ? (
        <p className="border-2 border-ht-line bg-ht-panel px-5 py-8 text-center text-sm text-ht-muted">
          No open opportunities in your categories right now. You&apos;ll get a notification the
          moment you&apos;re invited to one.
        </p>
      ) : (
        <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(19rem,1fr))]">
          {jobs.map((job) => (
            <div key={job.id}>
              <JobCard
                job={job}
                href={`/network/freelancer/jobs/${job.id}`}
                extraRequiredDocs={docLabels.get(job.id)}
              />
              {job.invites.length > 0 ? (
                <p className="ht-label mt-1.5 text-ht-gold">You&apos;re invited</p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
