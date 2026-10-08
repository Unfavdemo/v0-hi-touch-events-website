import Link from "next/link";
import { notFound } from "next/navigation";
import { HiredVendorDocuments } from "@/components/network/HiredVendorW9";
import { HiringPanel } from "@/components/network/HiringPanel";
import { JobCard } from "@/components/network/JobCard";
import { JobManagePanel } from "@/components/network/JobManagePanel";
import { JobMessageThread } from "@/components/network/JobMessageThread";
import { JobPartnerEventForm } from "@/components/network/partner/JobPartnerEventForm";
import { OpportunityRequiredDocumentsManager } from "@/components/network/OpportunityRequiredDocumentsManager";
import {
  getEventDocumentRequirements,
  mapJobRequirementsForDisplay,
} from "@/lib/network/document-requirements";
import { requirePartnerOrg } from "@/lib/network/partner-org";
import { prisma } from "@/lib/network/prisma";

export default async function PartnerJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user, ownerId } = await requirePartnerOrg();
  const { id } = await params;

  const job = await prisma.jobOpportunity.findUnique({
    where: { id },
    include: {
      categoryTag: true,
      partnerEvent: { select: { id: true, name: true } },
      postedBy: { include: { profile: true } },
      assignedFreelancer: { include: { profile: true } },
      bids: {
        include: { freelancer: { include: { profile: true } } },
        orderBy: { createdAt: "asc" },
      },
      invites: { include: { freelancer: { include: { profile: true } } } },
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
      documentRequirements: {
        include: { partnerRequirement: true },
        orderBy: { id: "asc" },
      },
    },
  });
  if (!job || job.postedById !== ownerId) notFound();

  const reqDisplay = mapJobRequirementsForDisplay(job.documentRequirements);
  const canEditReqs = job.status !== "COMPLETED" && job.status !== "FILLED";

  const eventReqs = job.partnerEventId
    ? await getEventDocumentRequirements(job.partnerEventId)
    : [];

  const partnerEvents = await prisma.partnerEvent.findMany({
    where: { partnerId: ownerId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-8">
      <Link href="/network/partner" className="ht-label text-ht-muted hover:text-ht-gold">
        ← Your opportunities
      </Link>

      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        <div className="space-y-4">
          <JobCard job={job} />
          {job.partnerEvent ? (
            <Link
              href={`/network/partner/events/${job.partnerEvent.id}`}
              className="block border-2 border-ht-gold/40 bg-ht-panel px-4 py-3 text-sm text-ht-gold hover:border-ht-gold"
            >
              Part of event: {job.partnerEvent.name}
            </Link>
          ) : null}
          <JobPartnerEventForm
            jobId={job.id}
            currentEventId={job.partnerEventId}
            events={partnerEvents}
          />
          {job.status === "PENDING_APPROVAL" ? (
            <p className="border-2 border-ht-blue/60 bg-ht-panel px-4 py-3 text-sm text-ht-blue-bright">
              Waiting on HiTouch Solutions verification. Invites go out to your top matches
              as soon as it&apos;s approved.
            </p>
          ) : null}
        </div>

        <div className="space-y-10">
          <div>
            <h1 className="text-2xl font-bold text-ht-cream">{job.title}</h1>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ht-muted">
              {job.description}
            </p>
            <Link
              href={`/network/partner/jobs/new?from=${job.id}`}
              className="ht-label mt-4 inline-block border-2 border-ht-line px-4 py-2 text-ht-muted hover:border-ht-gold hover:text-ht-gold"
            >
              Duplicate opportunity
            </Link>
          </div>
          <OpportunityRequiredDocumentsManager
            jobId={job.id}
            requirements={reqDisplay}
            eventRequirements={eventReqs}
            eventName={job.partnerEvent?.name}
            canEdit={canEditReqs}
          />
          <JobManagePanel job={job} viewerId={user.id} viewerRole="PARTNER" canManage />
          {job.assignedFreelancerId && job.assignedFreelancer ? (
            <>
              <HiredVendorDocuments
                partnerId={ownerId}
                vendorId={job.assignedFreelancerId}
                vendorName={
                  job.assignedFreelancer.profile?.name ?? job.assignedFreelancer.email
                }
              />
              {job.crewAssignments.length > 0 ? (
                <section className="border-2 border-ht-line bg-ht-panel p-5">
                  <h2 className="ht-label text-ht-muted">Assigned crew</h2>
                  <ul className="mt-3 space-y-2 text-sm text-ht-cream">
                    {job.crewAssignments.map((a) => (
                      <li key={a.id}>
                        <span className="font-semibold">{a.crewMember.name}</span>
                        <span className="text-ht-muted"> — {a.crewMember.role}</span>
                        {a.crewMember.phone ? (
                          <span className="text-ht-muted"> · {a.crewMember.phone}</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
              <JobMessageThread
                jobId={job.id}
                viewerId={user.id}
                canPost
                messages={job.messages}
              />
            </>
          ) : null}
          <HiringPanel job={job} canManage />
        </div>
      </div>
    </div>
  );
}
