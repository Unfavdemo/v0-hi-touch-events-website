import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/network/admin/AdminHeader";
import { SendPartnerEventDetailsForm } from "@/components/network/admin/SendPartnerEventDetailsForm";
import { EventRequiredDocumentsManager } from "@/components/network/EventRequiredDocumentsManager";
import { mapEventRequirementsForDisplay } from "@/lib/network/document-requirements";
import { JobCard } from "@/components/network/JobCard";
import { LinkJobToEventForm } from "@/components/network/partner/LinkJobToEventForm";
import { PartnerEventEditForm } from "@/components/network/partner/PartnerEventEditForm";
import { isSuperAdmin } from "@/lib/network/admin-rbac";
import { canAccessPartnerEvent, requireAdminEventsAccess } from "@/lib/network/event-organizer";
import { prisma } from "@/lib/network/prisma";
import { formatDateTime, toDatetimeLocalValue } from "@/lib/network/utils";

export default async function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await requireAdminEventsAccess();
  const superAdmin = isSuperAdmin(admin);
  const { id } = await params;

  const event = await prisma.partnerEvent.findUnique({
    where: { id },
    include: {
      partner: { include: { profile: true } },
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
  if (!event || !(await canAccessPartnerEvent(admin, event))) notFound();

  const partnerTemplates =
    event.partner.role === "PARTNER"
      ? await prisma.partnerDocumentRequirement.findMany({
          where: { partnerId: event.partnerId },
          orderBy: { sortOrder: "asc" },
        })
      : [];

  const unlinkedJobs = await prisma.jobOpportunity.findMany({
    where: {
      partnerEventId: null,
      OR: superAdmin
        ? [{ postedById: event.partnerId }]
        : [
            { postedById: admin.id },
            { delegations: { some: { adminId: admin.id } } },
          ],
    },
    orderBy: { eventStartTime: "desc" },
    select: { id: true, title: true },
    take: 80,
  });

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
      <Link href="/network/admin/events" className="ht-label text-ht-muted hover:text-ht-gold">
        ← Events
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <AdminHeader title={event.name}>
            {superAdmin && event.partnerId !== admin.id
              ? (event.partner.profile?.companyName ?? event.partner.email)
              : "Your event — opportunities post live without approval"}
            {event.applicationCloseAt
              ? ` · applications close ${formatDateTime(event.applicationCloseAt)}`
              : ""}
          </AdminHeader>
          {event.location ? (
            <p className="mt-2 text-sm text-ht-muted">{event.location}</p>
          ) : null}
          {event.description ? (
            <p className="mt-3 max-w-2xl whitespace-pre-line text-sm text-ht-muted">
              {event.description}
            </p>
          ) : null}
          <p className="mt-2 text-xs text-ht-muted">
            Outreach:{" "}
            {event.outreachAudience === "ALL_VENDORS"
              ? "All matching vendors"
              : "Recommended / invited only"}
            {event.initialOutreachSentAt ? " · first notice sent" : ""}
            {event.reminderTwoWeeksSentAt ? " · 2-week reminder sent" : ""}
            {event.reminderOneWeekSentAt ? " · 1-week reminder sent" : ""}
          </p>
          {scheduleStart && scheduleEnd ? (
            <p className="mt-2 text-sm text-ht-cream">
              Schedule span: {formatDateTime(scheduleStart)} → {formatDateTime(scheduleEnd)}
            </p>
          ) : null}
        </div>
        <Link
          href={`/network/admin/jobs/new?eventId=${event.id}`}
          className="ht-label border-2 border-ht-gold px-4 py-2 font-semibold text-ht-gold hover:bg-ht-gold hover:text-ht-black"
        >
          Post opportunity (goes live)
        </Link>
      </header>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="border-2 border-ht-line bg-ht-panel p-5">
          <h2 className="text-lg font-semibold text-ht-cream">Hired vendors</h2>
          {hiredVendors.size === 0 ? (
            <p className="mt-3 text-sm text-ht-muted">No vendors hired yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm text-ht-cream">
              {[...hiredVendors.entries()].map(([vid, name]) => (
                <li key={vid}>{name}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="border-2 border-ht-line bg-ht-panel p-5">
          <h2 className="text-lg font-semibold text-ht-cream">Event details</h2>
          {superAdmin ? (
            <p className="mt-1 text-xs text-ht-muted">
              Full admins can change name, schedule, outreach, and deadlines here — saves
              immediately for partners and vendors.
            </p>
          ) : null}
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
        canEdit
        requirements={mapEventRequirementsForDisplay(event.documentRequirements)}
        partnerTemplates={partnerTemplates.map((t) => ({
          id: t.id,
          label: t.label,
          description: t.description,
        }))}
      />

      <section className="border-2 border-ht-gold/40 bg-ht-panel p-5">
        <h2 className="text-lg font-semibold text-ht-cream">Send event details to hired vendors</h2>
        <p className="mt-1 text-sm text-ht-muted">Load-in, parking, contacts, run of show, etc.</p>
        <div className="mt-4">
          <SendPartnerEventDetailsForm eventId={event.id} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-ht-cream">
          Opportunities ({event.opportunities.length})
        </h2>
        {event.opportunities.length === 0 ? (
          <p className="text-sm text-ht-muted">Post or link an opportunity for this event.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {event.opportunities.map((job) => {
              const canEdit = job.status !== "COMPLETED" && job.status !== "FILLED";
              return (
                <div key={job.id} className="flex h-full flex-col gap-2">
                  <Link href={`/network/admin/jobs/${job.id}`} className="block flex-1">
                    <JobCard job={job} />
                  </Link>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <Link href={`/network/admin/jobs/${job.id}`} className="text-ht-muted hover:text-ht-gold">
                      Manage
                    </Link>
                    {canEdit ? (
                      <Link
                        href={`/network/admin/jobs/${job.id}/edit`}
                        className="text-ht-gold hover:text-ht-gold-bright"
                      >
                        Edit
                      </Link>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="border-2 border-ht-line bg-ht-panel p-5">
        <h2 className="text-lg font-semibold text-ht-cream">Link existing opportunity</h2>
        <div className="mt-4">
          <LinkJobToEventForm eventId={event.id} unlinkedJobs={unlinkedJobs} />
        </div>
      </section>
    </div>
  );
}
