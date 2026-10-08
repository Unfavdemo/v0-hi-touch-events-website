import { JobForm } from "@/components/network/JobForm";
import Link from "next/link";
import { formatCustomRequirementLines } from "@/lib/network/document-requirements";
import { requirePartnerOrg } from "@/lib/network/partner-org";
import { prisma } from "@/lib/network/prisma";

export default async function PartnerNewJobPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string | string[]; eventId?: string | string[] }>;
}) {
  const { ownerId } = await requirePartnerOrg();
  const tags = await prisma.categoryTag.findMany({ orderBy: { name: "asc" } });
  const params = await searchParams;
  const fromRaw = params.from;
  const fromId = Array.isArray(fromRaw) ? fromRaw[0] : fromRaw;
  const eventRaw = params.eventId;
  const eventId = Array.isArray(eventRaw) ? eventRaw[0] : eventRaw;

  const [source, venues, partnerRequirements, sourceRequirements, partnerEvents, presetEvent] =
    await Promise.all([
    fromId
      ? prisma.jobOpportunity.findFirst({
          where: { id: fromId, postedById: ownerId },
        })
      : Promise.resolve(null),
    prisma.savedVenue.findMany({
      where: { partnerId: ownerId },
      orderBy: { name: "asc" },
    }),
    prisma.partnerDocumentRequirement.findMany({
      where: { partnerId: ownerId },
      orderBy: { sortOrder: "asc" },
    }),
    fromId
      ? prisma.jobDocumentRequirement.findMany({
          where: { jobId: fromId },
          select: { partnerRequirementId: true, customLabel: true, customDescription: true },
        })
      : Promise.resolve([]),
    prisma.partnerEvent.findMany({
      where: { partnerId: ownerId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    eventId
      ? prisma.partnerEvent.findFirst({
          where: { id: eventId, partnerId: ownerId },
          select: { id: true, name: true, location: true },
        })
      : Promise.resolve(null),
  ]);

  return (
    <div>
      <p className="ht-label text-ht-blue-bright">Partner</p>
      <h1 className="mt-1 text-3xl font-bold text-ht-cream">
        {presetEvent
          ? `Post opportunity — ${presetEvent.name}`
          : source
            ? "Duplicate opportunity"
            : "Post an opportunity"}
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-ht-muted">
        {presetEvent
          ? "This posting will be linked to your event. Each opportunity can hire its own vendor."
          : source
            ? "Details are copied. Set the new setup, live, and breakdown times, then submit — HiTouch verifies each posting."
            : "Tell us what you need and when. After HiTouch Solutions verifies it, we invite the best-matched vendors who are free for your setup-to-breakdown window. You review who applies and pick who works best."}
      </p>
      {presetEvent ? (
        <Link
          href={`/network/partner/events/${presetEvent.id}`}
          className="mt-3 inline-block text-sm text-ht-gold hover:text-ht-gold-bright"
        >
          ← Back to event
        </Link>
      ) : null}
      <div className="mt-8">
        <JobForm
          key={source?.id ?? presetEvent?.id ?? "new"}
          posterKind="partner"
          partnerEvents={partnerEvents}
          defaultPartnerEventId={presetEvent?.id}
          returnToEvent={Boolean(presetEvent)}
          tags={tags.map((t) => ({ id: t.id, name: t.name }))}
          partnerRequirements={partnerRequirements.map((r) => ({
            id: r.id,
            label: r.label,
            description: r.description,
          }))}
          venues={venues.map((v) => ({
            id: v.id,
            name: v.name,
            address: v.address,
            notes: v.notes,
            contactName: v.contactName,
            contactPhone: v.contactPhone,
          }))}
          defaults={
            source
              ? {
                  title: source.title,
                  description: source.description,
                  categoryTagId: source.categoryTagId,
                  payRate: source.payRate.toString(),
                  location: source.location,
                  isOpenBidding: source.isOpenBidding,
                  sourceTitle: source.title,
                  requirementIds: sourceRequirements
                    .map((r) => r.partnerRequirementId)
                    .filter((id): id is string => Boolean(id)),
                  customRequirementLabels: formatCustomRequirementLines(
                    sourceRequirements
                      .filter((r) => !r.partnerRequirementId && r.customLabel)
                      .map((r) => ({
                        label: r.customLabel!,
                        description: r.customDescription ?? undefined,
                      })),
                  ),
                }
              : presetEvent?.location
                ? { location: presetEvent.location }
                : undefined
          }
        />
      </div>
    </div>
  );
}
