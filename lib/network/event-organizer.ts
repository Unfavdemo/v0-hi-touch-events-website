import { redirect } from "next/navigation";
import type { SessionUser } from "@/lib/network/auth";
import { getCurrentUser, requireUser } from "@/lib/network/auth";
import { canManageJob, isEventAdmin, isSuperAdmin } from "@/lib/network/admin-rbac";
import { isPartnerOrgMember, partnerOwnerId } from "@/lib/network/partner-org";
import { prisma } from "@/lib/network/prisma";

export type EventOrganizerContext = {
  user: SessionUser;
  organizerId: string;
  eventsBasePath: "/partner/events" | "/admin/events";
  jobsBasePath: "/partner/jobs" | "/admin/jobs";
  isPartner: boolean;
};

export async function requireEventOrganizer(): Promise<EventOrganizerContext> {
  const user = await getCurrentUser();
  if (!user || user.status !== "APPROVED") redirect("/network/login");

  if (user.role === "PARTNER") {
    const organizerId = await partnerOwnerId(user.id);
    return {
      user,
      organizerId,
      eventsBasePath: "/partner/events",
      jobsBasePath: "/partner/jobs",
      isPartner: true,
    };
  }

  if (user.role === "ADMIN" && (isSuperAdmin(user) || isEventAdmin(user))) {
    return {
      user,
      organizerId: user.id,
      eventsBasePath: "/admin/events",
      jobsBasePath: "/admin/jobs",
      isPartner: false,
    };
  }

  redirect("/network/login");
}

export async function requireAdminEventsAccess(): Promise<SessionUser> {
  const user = await requireUser("ADMIN");
  if (!isSuperAdmin(user) && !isEventAdmin(user)) redirect("/network/admin");
  return user;
}

export function partnerEventsWhere(
  user: SessionUser,
): { partnerId: string } | Record<string, never> {
  if (isSuperAdmin(user)) return {};
  return { partnerId: user.id };
}

export async function canAccessPartnerEvent(
  user: SessionUser,
  event: { partnerId: string },
): Promise<boolean> {
  if (isSuperAdmin(user)) return true;
  if (event.partnerId === user.id) return true;
  if (user.role === "PARTNER") {
    return isPartnerOrgMember(user.id, event.partnerId);
  }
  return false;
}

/** View or edit — full admins can change any event on the spot. */
export async function canManagePartnerEvent(
  user: SessionUser,
  eventId: string,
): Promise<boolean> {
  const event = await prisma.partnerEvent.findUnique({
    where: { id: eventId },
    select: { partnerId: true },
  });
  if (!event) return false;
  return canAccessPartnerEvent(user, event);
}

export async function eventAndJobSameOwner(
  eventId: string,
  jobId: string,
): Promise<boolean> {
  const [event, job] = await Promise.all([
    prisma.partnerEvent.findUnique({
      where: { id: eventId },
      select: { partnerId: true },
    }),
    prisma.jobOpportunity.findUnique({
      where: { id: jobId },
      select: { postedById: true },
    }),
  ]);
  if (!event || !job) return false;
  return event.partnerId === job.postedById;
}

export async function assertOrganizerJobAccess(
  ctx: EventOrganizerContext,
  jobId: string,
): Promise<boolean> {
  const job = await prisma.jobOpportunity.findUnique({
    where: { id: jobId },
    select: { id: true, postedById: true },
  });
  if (!job) return false;
  if (job.postedById === ctx.organizerId) return true;
  if (ctx.isPartner && (await isPartnerOrgMember(ctx.user.id, job.postedById))) return true;
  if (!ctx.isPartner && (await canManageJob(ctx.user, job))) return true;
  return false;
}
