import Link from "next/link";
import { notFound } from "next/navigation";
import { JobCard } from "@/components/network/JobCard";
import { LinkJobToEventForm } from "@/components/network/partner/LinkJobToEventForm";
import { EventRequiredDocumentsManager } from "@/components/network/EventRequiredDocumentsManager";
import { PartnerEventEditForm } from "@/components/network/partner/PartnerEventEditForm";
import { mapEventRequirementsForDisplay } from "@/lib/network/document-requirements";
import { requirePartnerOrg } from "@/lib/network/partner-org";
import { prisma } from "@/lib/network/prisma";
import { formatDateTime, toDatetimeLocalValue } from "@/lib/network/utils";

export default async function PartnerEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { ownerId, isOwner } = await requirePartnerOrg();
  const { id } = await params;

  const event = await prisma.partnerEvent.findFirst({
    where: { id, partnerId: ownerId },
    include: {
      documentRequirements: {
        include: { partnerRequirement: true },
        orderBy: { id: "asc" },
      },
      opportunities: {
        include: {
          categoryTag: true,
          assignedFreelancer: { include: { profile: true } },
        },
        orderBy: { eventStartTime: "asc" },
      },
    },
  });
  if (!event) notFound();

  const [unlinkedJobs, partnerTemplates] = await Promise.all([
    prisma.jobOpportunity.findMany({
      where: { postedById: ownerId, partnerEventId: null },
      orderBy: { eventStartTime: "desc" },
      select: { id: true, title: true },
      take: 80,
    }),
    prisma.partnerDocumentRequirement.findMany({
      where: { partnerId: ownerId },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const hiredVendors = new Map<string, string>();
  for (const job of event.opportunities) {
    if (job.assignedFreelancer) {
      hiredVendors.set(
        job.assignedFreelancer.id,
        job.assignedFreelancer.profile?.name ?? job.assignedFreelancer.email,
      );
    }
  }

  const scheduleStart = event.opportunities[0]?.eventStartTime;
  const scheduleEnd = event.opportunities[event.opportunities.length - 1]?.eventEndTime;

  return (
    <div className="space-y-10">
      <Link href="/network/partner/events" className="ht-label text-ht-muted hover:text-ht-gold">
        ← Events
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="ht-label text-ht-blue-bright">Event</p>
          <h1 className="mt-1 text-3xl font-bold text-ht-cream">{event.name}</h1>
          {event.location ? (
            <p className="mt-2 text-sm text-ht-muted">{event.location}</p>
          ) : null}
          {event.description ? (
            <p className="mt-3 max-w-2xl whitespace-pre-line text-sm text-ht-muted">
              {event.description}
            </p>
          ) : null}
          {event.applicationCloseAt ? (
            <p className="mt-2 text-sm text-ht-gold">
              Applications close {formatDateTime(event.applicationCloseAt)}
            </p>
          ) : null}
          <p className="mt-1 text-xs text-ht-muted">
            Outreach:{" "}
            {event.outreachAudience === "ALL_VENDORS"
              ? "All matching vendors"
              : "Recommended / invited only"}
            {event.initialOutreachSentAt ? " · first notice sent" : " · first notice pending active roles"}
            {event.reminderTwoWeeksSentAt ? " · 2-week reminder sent" : ""}
            {event.reminderOneWeekSentAt ? " · 1-week reminder sent" : ""}
          </p>
          {scheduleStart && scheduleEnd ? (
            <p className="mt-2 text-sm text-ht-cream">
              Schedule span: {formatDateTime(scheduleStart)} → {formatDateTime(scheduleEnd)}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/network/partner/jobs/new?eventId=${event.id}`}
            className="ht-label border-2 border-ht-gold px-4 py-2 font-semibold text-ht-gold hover:bg-ht-gold hover:text-ht-black"
          >
            Post opportunity for this event
          </Link>
        </div>
      </header>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="border-2 border-ht-line bg-ht-panel p-5">
          <h2 className="text-lg font-semibold text-ht-cream">Vendors on this event</h2>
          <p className="mt-1 text-sm text-ht-muted">
            Each opportunity hires separately — one event, many vendors.
          </p>
          {hiredVendors.size === 0 ? (
            <p className="mt-4 text-sm text-ht-muted">No vendors hired yet.</p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm text-ht-cream">
              {[...hiredVendors.entries()].map(([id, name]) => (
                <li key={id}>{name}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="border-2 border-ht-line bg-ht-panel p-5">
          <h2 className="text-lg font-semibold text-ht-cream">Event details</h2>
          <div className="mt-4">
            <PartnerEventEditForm
              eventId={event.id}
              name={event.name}
              description={event.description}
              location={event.location}
              applicationCloseAtLocal={toDatetimeLocalValue(event.applicationCloseAt)}
              outreachAudience={event.outreachAudience}
            />
          </div>
        </div>
      </section>

      <EventRequiredDocumentsManager
        eventId={event.id}
        canEdit={isOwner}
        requirements={mapEventRequirementsForDisplay(event.documentRequirements)}
        partnerTemplates={partnerTemplates.map((t) => ({
          id: t.id,
          label: t.label,
          description: t.description,
        }))}
      />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-ht-cream">
          Opportunities ({event.opportunities.length})
        </h2>
        {event.opportunities.length === 0 ? (
          <p className="text-sm text-ht-muted">
            Link an existing posting or post a new role for this event.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {event.opportunities.map((job) => (
              <Link key={job.id} href={`/network/partner/jobs/${job.id}`} className="block h-full">
                <JobCard job={job} />
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="border-2 border-ht-line bg-ht-panel p-5">
        <h2 className="text-lg font-semibold text-ht-cream">Link existing opportunity</h2>
        <p className="mt-1 text-sm text-ht-muted">
          Connect a posting you already created to this event.
        </p>
        <div className="mt-4">
          <LinkJobToEventForm eventId={event.id} unlinkedJobs={unlinkedJobs} />
        </div>
      </section>
    </div>
  );
}
