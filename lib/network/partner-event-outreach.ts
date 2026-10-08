import type { PartnerEventOutreachAudience, Prisma } from "@/lib/generated/network-prisma/client";
import { scoreVendorsForJob } from "@/lib/network/matching";
import { prisma } from "@/lib/network/prisma";
import { formatDateTime } from "@/lib/network/utils";
import { parseNotificationPrefs } from "@/lib/network/vendor-prefs";

const DAY_MS = 24 * 60 * 60 * 1000;

type EventWithJobs = Prisma.PartnerEventGetPayload<{
  include: {
    opportunities: {
      include: { invites: { select: { freelancerId: true } } };
    };
  };
}>;

function eventTag(eventId: string): string {
  return `[event:${eventId}]`;
}

function stripEventTag(message: string): string {
  return message.replace(/\s*\[event:[^\]]+\]\s*$/, "").trim();
}

export function daysUntilClose(closeAt: Date): number {
  return Math.ceil((closeAt.getTime() - Date.now()) / DAY_MS);
}

export async function loadPartnerEventForOutreach(eventId: string): Promise<EventWithJobs | null> {
  return prisma.partnerEvent.findUnique({
    where: { id: eventId },
    include: {
      opportunities: {
        where: { status: { in: ["ACTIVE", "PENDING_APPROVAL"] } },
        include: { invites: { select: { freelancerId: true } } },
      },
    },
  });
}

async function vendorsWhoApplied(eventId: string): Promise<Set<string>> {
  const bids = await prisma.bidProposal.findMany({
    where: { job: { partnerEventId: eventId } },
    select: { freelancerId: true },
  });
  return new Set(bids.map((b) => b.freelancerId));
}

export async function resolveEventOutreachVendorIds(
  event: EventWithJobs,
  audience: PartnerEventOutreachAudience,
): Promise<string[]> {
  const activeJobs = event.opportunities.filter((j) => j.status === "ACTIVE");
  if (activeJobs.length === 0) return [];

  if (audience === "INVITED_ONLY") {
    const ids = new Set<string>();
    for (const job of activeJobs) {
      for (const inv of job.invites) ids.add(inv.freelancerId);
    }
    return [...ids];
  }

  const ids = new Set<string>();
  for (const job of activeJobs) {
    const matches = await scoreVendorsForJob(job);
    for (const m of matches) ids.add(m.freelancerId);
  }
  return [...ids];
}

async function notifyVendors(
  vendorIds: string[],
  type: "EVENT_OUTREACH" | "APPLICATION_CLOSE_REMINDER",
  messageBody: string,
  eventId: string,
): Promise<number> {
  if (vendorIds.length === 0) return 0;

  const users = await prisma.user.findMany({
    where: { id: { in: vendorIds }, role: "FREELANCER", status: "APPROVED" },
    select: { id: true, profile: { select: { notificationPrefs: true } } },
  });

  const message = `${messageBody} ${eventTag(eventId)}`;
  const rows = users
    .filter((u) => parseNotificationPrefs(u.profile?.notificationPrefs).invites)
    .map((u) => ({ userId: u.id, type, message }));

  if (rows.length === 0) return 0;
  await prisma.notification.createMany({ data: rows });
  return rows.length;
}

export async function trySendInitialEventOutreach(eventId: string): Promise<boolean> {
  const event = await loadPartnerEventForOutreach(eventId);
  if (!event || event.initialOutreachSentAt || !event.applicationCloseAt) return false;

  const vendorIds = await resolveEventOutreachVendorIds(event, event.outreachAudience);
  if (vendorIds.length === 0) return false;

  const applied = await vendorsWhoApplied(eventId);
  const targets = vendorIds.filter((id) => !applied.has(id));
  const closeLabel = formatDateTime(event.applicationCloseAt);
  const body = `New event "${event.name}" — review linked opportunities and apply before applications close ${closeLabel}.`;
  await notifyVendors(targets, "EVENT_OUTREACH", body, eventId);

  await prisma.partnerEvent.update({
    where: { id: eventId },
    data: { initialOutreachSentAt: new Date() },
  });
  return true;
}

async function sendDeadlineReminder(
  event: EventWithJobs,
  kind: "two_week" | "one_week",
): Promise<void> {
  if (!event.applicationCloseAt) return;
  const vendorIds = await resolveEventOutreachVendorIds(event, event.outreachAudience);
  const applied = await vendorsWhoApplied(event.id);
  const targets = vendorIds.filter((id) => !applied.has(id));
  const closeLabel = formatDateTime(event.applicationCloseAt);
  const when =
    kind === "two_week"
      ? "Applications close in about 2 weeks"
      : "Applications close in about 1 week";
  const body = `${when} for "${event.name}" (${closeLabel}). Apply on your Invites or job board.`;
  await notifyVendors(targets, "APPLICATION_CLOSE_REMINDER", body, event.id);

  await prisma.partnerEvent.update({
    where: { id: event.id },
    data:
      kind === "two_week"
        ? { reminderTwoWeeksSentAt: new Date() }
        : { reminderOneWeekSentAt: new Date() },
  });
}

/** Runs on portal loads — sends 2-week and 1-week reminders before application close. */
export async function ensurePartnerEventApplicationReminders(): Promise<void> {
  const now = new Date();
  const events = await prisma.partnerEvent.findMany({
    where: {
      applicationCloseAt: { gt: now },
    },
    include: {
      opportunities: {
        where: { status: "ACTIVE" },
        include: { invites: { select: { freelancerId: true } } },
      },
    },
  });

  for (const event of events) {
    if (!event.applicationCloseAt || event.opportunities.length === 0) continue;
    const days = daysUntilClose(event.applicationCloseAt);

    if (
      !event.reminderTwoWeeksSentAt &&
      days <= 14 &&
      days > 7
    ) {
      await sendDeadlineReminder(event, "two_week");
    } else if (
      !event.reminderOneWeekSentAt &&
      days <= 7 &&
      days > 0
    ) {
      await sendDeadlineReminder(event, "one_week");
    }
  }
}

export async function afterJobActivatedForEvent(jobId: string): Promise<void> {
  const job = await prisma.jobOpportunity.findUnique({
    where: { id: jobId },
    select: { partnerEventId: true },
  });
  if (!job?.partnerEventId) return;
  await trySendInitialEventOutreach(job.partnerEventId);
}

export async function isEventApplicationOpen(jobId: string): Promise<boolean> {
  const job = await prisma.jobOpportunity.findUnique({
    where: { id: jobId },
    select: {
      partnerEvent: { select: { applicationCloseAt: true } },
    },
  });
  const close = job?.partnerEvent?.applicationCloseAt;
  if (!close) return true;
  return new Date() <= close;
}

export { stripEventTag };
