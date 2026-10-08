import Link from "next/link";
import { notFound } from "next/navigation";
import { BidForm } from "@/components/network/BidForm";
import { VendorCheckInButtons } from "@/components/network/CheckInPanel";
import { JobCrewAssignForm } from "@/components/network/freelancer/JobCrewAssignForm";
import { JobCard } from "@/components/network/JobCard";
import { JobManagePanel } from "@/components/network/JobManagePanel";
import { JobMessageThread } from "@/components/network/JobMessageThread";
import { ApplicationStatusTip, QuoteTip, VendorInvitesTip } from "@/components/network/help/Tips";
import { applicationStatusLabel, Badge, statusBadgeVariant } from "@/components/network/ui/Badge";
import { Button } from "@/components/network/ui/Button";
import { requireUser } from "@/lib/network/auth";
import { declineInvite } from "@/lib/network/jobs";
import { matchReasonsFromJson } from "@/lib/network/matching";
import { ApplicationRequirementsPanel } from "@/components/network/ApplicationRequirementsPanel";
import { VendorRequiredDocsNotice } from "@/components/network/VendorRequiredDocsNotice";
import {
  evaluateApplicationRequirements,
  getClientRequiredDocuments,
} from "@/lib/network/document-requirements";
import { PAPERWORK_APPLY_MESSAGE } from "@/lib/network/paperwork";
import { prisma } from "@/lib/network/prisma";
import { formatMoney } from "@/lib/network/utils";

export default async function FreelancerJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser("FREELANCER");
  const { id } = await params;

  const job = await prisma.jobOpportunity.findUnique({
    where: { id },
    include: {
      categoryTag: true,
      postedBy: { include: { profile: true } },
      assignedFreelancer: { include: { profile: true } },
      bids: { where: { freelancerId: user.id } },
      invites: { where: { freelancerId: user.id } },
      reviews: {
        include: { reviewer: { include: { profile: true } } },
        orderBy: { createdAt: "asc" },
      },
      messages: {
        include: { sender: { include: { profile: true } } },
        orderBy: { createdAt: "asc" },
      },
      crewAssignments: {
        include: { crewMember: true },
      },
    },
  });
  if (!job) notFound();

  const tagIds = user.profile?.categoryTags.map((t) => t.id) ?? [];
  const isAssignedToMe = job.assignedFreelancerId === user.id;
  const isMine = job.postedById === user.id;
  const tagMatches = tagIds.includes(job.categoryTagId);
  const invite = job.invites[0] ?? null;
  const pendingInvite = invite?.status === "PENDING" && job.status === "ACTIVE";

  // Vendors see open-board opportunities in their categories, events they're invited to,
  // and anything they're assigned to or posted.
  const visible =
    isAssignedToMe || isMine || !!invite || (tagMatches && job.isOpenBidding);
  if (!visible) notFound();

  const myBid = job.bids[0] ?? null;
  const clientDocs = await getClientRequiredDocuments(job.id);
  const { ready: docsReady, requirements: applyRequirements } =
    await evaluateApplicationRequirements({
      vendorId: user.id,
      profile: user.profile,
      jobId: job.id,
    });
  const isBusiness = user.profile?.type === "BUSINESS";
  const crewMembers = isBusiness
    ? await prisma.vendorCrewMember.findMany({
        where: { vendorId: user.id },
        orderBy: { name: "asc" },
      })
    : [];
  const canApply =
    job.status === "ACTIVE" &&
    !myBid &&
    !isMine &&
    docsReady &&
    (pendingInvite || (job.isOpenBidding && tagMatches));
  const wouldApply =
    job.status === "ACTIVE" &&
    !myBid &&
    !isMine &&
    (pendingInvite || (job.isOpenBidding && tagMatches));

  return (
    <div className="space-y-8">
      <Link
        href={invite ? "/freelancer/invites" : "/freelancer/jobs"}
        className="ht-label text-ht-muted hover:text-ht-gold"
      >
        ← {invite ? "Invites" : "Job board"}
      </Link>

      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        <div className="space-y-4">
          <JobCard job={job} />
          {isAssignedToMe ? (
            <div className="space-y-3 border-2 border-ht-blue bg-ht-panel p-5">
              <p className="ht-label text-ht-blue-bright">You&apos;re booked</p>
              <VendorCheckInButtons job={job} />
              {isBusiness ? (
                <div className="border-t border-ht-line pt-4">
                  <p className="ht-label text-ht-muted">Crew on site</p>
                  <div className="mt-3">
                    <JobCrewAssignForm
                      jobId={job.id}
                      members={crewMembers.map((m) => ({
                        id: m.id,
                        name: m.name,
                        role: m.role,
                      }))}
                      assignedIds={job.crewAssignments.map((a) => a.crewMemberId)}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div>
          <h1 className="text-2xl font-bold text-ht-cream">{job.title}</h1>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ht-muted">
            {job.description}
          </p>

          {job.status === "ACTIVE" && !isMine ? (
            <div className="mt-6 space-y-4">
              <VendorRequiredDocsNotice clientDocs={clientDocs} />
              <ApplicationRequirementsPanel
                requirements={applyRequirements}
                ready={docsReady}
              />
            </div>
          ) : null}

          {pendingInvite && invite ? (
            <div className="mt-6 border-2 border-ht-blue bg-ht-panel p-5">
              <p className="ht-label text-ht-gold">
                {invite.source === "PARTNER"
                  ? "The partner hand-picked you for this opportunity"
                  : "You're on the HiTouch shortlist for this opportunity"}
                <VendorInvitesTip />
              </p>
              <ul className="mt-2 space-y-1 text-sm text-ht-cream">
                {matchReasonsFromJson(invite.matchReasons).map((r) => (
                  <li key={r}>· {r}</li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-ht-muted">
                Apply with your quote below, or decline so we can offer the spot to someone
                else. Being invited doesn&apos;t guarantee you&apos;re picked.
              </p>
            </div>
          ) : null}

          <div id="apply" className="mt-8 space-y-6">
            {myBid ? (
              <div className="border-2 border-ht-line bg-ht-panel p-5">
                <p className="ht-label text-ht-muted">Your application</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <span className="text-xl font-bold text-ht-gold">
                    {formatMoney(myBid.amount.toString())}
                  </span>
                  <Badge variant={statusBadgeVariant(myBid.status)}>
                    {applicationStatusLabel(myBid.status)}
                  </Badge>
                  <ApplicationStatusTip />
                </div>
                {myBid.notes ? (
                  <p className="mt-2 text-sm text-ht-muted">{myBid.notes}</p>
                ) : null}
              </div>
            ) : wouldApply && !docsReady ? (
              <div className="max-w-lg border-2 border-ht-gold/50 bg-ht-panel p-5">
                <p className="ht-label text-ht-gold">Required documents missing</p>
                <p className="mt-2 text-sm text-ht-muted">{PAPERWORK_APPLY_MESSAGE}</p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Link
                    href="/network/freelancer/documents"
                    className="ht-label inline-flex items-center border-2 border-ht-gold px-4 py-2 text-ht-gold hover:bg-ht-gold hover:text-white"
                  >
                    Go to Documents
                  </Link>
                  {pendingInvite && invite ? (
                    <form action={declineInvite.bind(null, invite.id)}>
                      <Button type="submit" variant="danger" size="sm">
                        Decline invite
                      </Button>
                    </form>
                  ) : null}
                </div>
              </div>
            ) : canApply ? (
              <div className="max-w-lg border-2 border-ht-gold/50 bg-ht-panel p-5">
                <p className="ht-label text-ht-gold">
                  Apply to this opportunity
                  <QuoteTip />
                </p>
                <p className="mt-1 text-sm text-ht-muted">
                  Posted rate: {formatMoney(job.payRate.toString())}. Quotes at or under the
                  rate rank higher with the partner.
                </p>
                <div className="mt-4">
                  <BidForm
                    jobId={job.id}
                    extraActions={
                      pendingInvite && invite ? (
                        <form action={declineInvite.bind(null, invite.id)}>
                          <Button type="submit" variant="danger" size="sm">
                            Decline invite
                          </Button>
                        </form>
                      ) : null
                    }
                  />
                </div>
              </div>
            ) : !isMine && !isAssignedToMe ? (
              <p className="border-2 border-ht-line bg-ht-panel px-4 py-3 text-sm text-ht-muted">
                {job.status !== "ACTIVE"
                  ? "This opportunity is no longer accepting applications."
                  : invite?.status === "DECLINED"
                    ? "You declined this invite."
                    : "This opportunity is invite-only."}
              </p>
            ) : null}
          </div>

          {isAssignedToMe ? (
            <div className="mt-10 space-y-10">
              <JobManagePanel job={job} viewerId={user.id} viewerRole="FREELANCER" />
              <JobMessageThread
                jobId={job.id}
                viewerId={user.id}
                canPost
                messages={job.messages}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
