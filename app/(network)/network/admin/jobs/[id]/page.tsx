import Link from "next/link";
import { notFound } from "next/navigation";
import { DelegateEventForm } from "@/components/network/DelegateEventForm";
import { HiringPanel } from "@/components/network/HiringPanel";
import { JobCard } from "@/components/network/JobCard";
import { JobManagePanel } from "@/components/network/JobManagePanel";
import { JobMessageThread } from "@/components/network/JobMessageThread";
import { Button } from "@/components/network/ui/Button";
import { canManageJob, isSuperAdmin } from "@/lib/network/admin-rbac";
import { requireUser } from "@/lib/network/auth";
import { revokeEventDelegation } from "@/lib/network/delegation-actions";
import { JobPartnerEventForm } from "@/components/network/partner/JobPartnerEventForm";
import { OpportunityRequiredDocumentsManager } from "@/components/network/OpportunityRequiredDocumentsManager";
import {
  getEventDocumentRequirements,
  mapJobRequirementsForDisplay,
} from "@/lib/network/document-requirements";
import { approveJob } from "@/lib/network/jobs";
import { label } from "@/lib/network/labels";
import { prisma } from "@/lib/network/prisma";

export default async function AdminJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await requireUser("ADMIN");
  const superAdmin = isSuperAdmin(admin);
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
      delegations: { include: { admin: { include: { profile: true } } } },
      messages: {
        include: { sender: { include: { profile: true } } },
        orderBy: { createdAt: "asc" },
      },
      documentRequirements: {
        include: { partnerRequirement: true },
        orderBy: { id: "asc" },
      },
    },
  });
  if (!job) notFound();
  if (!(await canManageJob(admin, job))) notFound();

  const reqDisplay = mapJobRequirementsForDisplay(job.documentRequirements);
  const canEditReqs = job.status !== "COMPLETED" && job.status !== "FILLED";

  const eventAdmins = superAdmin
    ? await prisma.user.findMany({
        where: { role: "ADMIN", adminScope: "EVENT", status: "APPROVED" },
        include: { profile: true },
        orderBy: { createdAt: "asc" },
      })
    : [];
  const assignedIds = new Set(job.delegations.map((d) => d.adminId));
  const available = eventAdmins
    .filter((a) => !assignedIds.has(a.id))
    .map((a) => ({ id: a.id, name: a.profile?.name ?? a.email }));

  const partnerEvents = await prisma.partnerEvent.findMany({
    where: { partnerId: job.postedById },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  const eventReqs = job.partnerEventId
    ? await getEventDocumentRequirements(job.partnerEventId)
    : [];
  const canEditJob = job.status !== "COMPLETED" && job.status !== "FILLED";

  return (
    <div className="space-y-8">
      <Link href="/network/admin/jobs" className="ht-label text-ht-muted hover:text-ht-gold">
        ← {superAdmin ? "All opportunities" : "Your opportunities"}
      </Link>

      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        <div className="space-y-4">
          <JobCard job={job} />
          {job.partnerEvent ? (
            <Link
              href={`/network/admin/events/${job.partnerEvent.id}`}
              className="block border-2 border-ht-gold/40 bg-ht-panel px-4 py-3 text-sm text-ht-gold hover:border-ht-gold"
            >
              Part of event: {job.partnerEvent.name}
              {superAdmin ? " · edit event" : ""}
            </Link>
          ) : null}
          {partnerEvents.length > 0 || job.partnerEventId ? (
            <JobPartnerEventForm
              jobId={job.id}
              currentEventId={job.partnerEventId}
              events={partnerEvents}
            />
          ) : null}
          {canEditJob ? (
            <Link
              href={`/network/admin/jobs/${job.id}/edit`}
              className="block border-2 border-ht-line bg-ht-panel px-4 py-3 text-center text-sm font-semibold text-ht-gold hover:border-ht-gold"
            >
              Edit opportunity details
            </Link>
          ) : null}
          <div className="border-2 border-ht-line bg-ht-panel p-4 text-sm">
            <p className="ht-label text-ht-muted">Organization</p>
            <p className="mt-1 font-semibold text-ht-cream">
              {job.postedBy.profile?.companyName ??
                job.postedBy.profile?.name ??
                job.postedBy.email}
            </p>
            {job.postedBy.profile?.companyName && job.postedBy.profile?.name ? (
              <p className="mt-1 text-ht-muted">{job.postedBy.profile.name}</p>
            ) : null}
            <p className="mt-1 text-xs text-ht-muted">
              {label(job.postedBy.role)}
              {job.postedBy.email ? ` · ${job.postedBy.email}` : ""}
            </p>
          </div>
          {job.status === "PENDING_APPROVAL" ? (
            <form action={approveJob.bind(null, job.id)}>
              <Button type="submit" variant="blue" className="w-full">
                Approve &amp; send invites
              </Button>
            </form>
          ) : null}
          {superAdmin ? (
            <Link
              href={`/network/admin/announcements?jobId=${job.id}`}
              className="block border-2 border-ht-line bg-ht-panel px-4 py-3 text-center text-sm font-semibold text-ht-gold hover:border-ht-gold"
            >
              Send announcement for this opportunity
            </Link>
          ) : null}
          {superAdmin ? (
            <div className="border-2 border-ht-line bg-ht-panel p-4">
              <p className="ht-label text-ht-muted">Opportunity admins</p>
              {job.delegations.length === 0 ? (
                <p className="mt-2 text-sm text-ht-muted">None assigned yet.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {job.delegations.map((d) => (
                    <li key={d.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-ht-cream">
                        {d.admin.profile?.name ?? d.admin.email}
                      </span>
                      <form action={revokeEventDelegation.bind(null, d.id)}>
                        <Button type="submit" size="sm" variant="ghost">
                          Remove
                        </Button>
                      </form>
                    </li>
                  ))}
                </ul>
              )}
              <DelegateEventForm jobId={job.id} admins={available} />
            </div>
          ) : null}
        </div>

        <div>
          <h1 className="text-2xl font-bold text-ht-cream">{job.title}</h1>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ht-muted">
            {job.description}
          </p>
          <div className="mt-8 space-y-10">
            <OpportunityRequiredDocumentsManager
              jobId={job.id}
              requirements={reqDisplay}
              eventRequirements={eventReqs}
              eventName={job.partnerEvent?.name}
              canEdit={canEditReqs}
            />
            <JobManagePanel job={job} viewerId={admin.id} viewerRole="ADMIN" />
            {job.assignedFreelancerId ? (
              <JobMessageThread
                jobId={job.id}
                viewerId={admin.id}
                canPost
                messages={job.messages}
              />
            ) : null}
            <HiringPanel job={job} canManage />
          </div>
        </div>
      </div>
    </div>
  );
}
