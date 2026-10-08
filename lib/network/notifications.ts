import type { NotificationType, Prisma, PrismaClient } from "@/lib/generated/network-prisma/client";
import { prisma } from "@/lib/network/prisma";
import { formatDateTime } from "@/lib/network/utils";

type Db = PrismaClient | Prisma.TransactionClient;

export async function createNotification(
  db: Db,
  userId: string,
  type: NotificationType,
  message: string,
): Promise<void> {
  await db.notification.create({ data: { userId, type, message } });
}

export async function notifyAdmins(
  db: Db,
  type: NotificationType,
  message: string,
): Promise<void> {
  const admins = await db.user.findMany({
    where: {
      role: "ADMIN",
      status: "APPROVED",
      OR: [{ adminScope: "SUPER" }, { adminScope: null }],
    },
    select: { id: true },
  });
  if (admins.length === 0) return;
  await db.notification.createMany({
    data: admins.map((a) => ({ userId: a.id, type, message })),
  });
}

/** Owner plus coordinators on this partner org. Skips `exceptUserId` when set. */
export async function notifyPartnerOrg(
  db: Db,
  ownerId: string,
  type: NotificationType,
  message: string,
  exceptUserId?: string,
): Promise<void> {
  const seats = await db.partnerMember.findMany({
    where: { ownerId },
    select: { memberId: true },
  });
  const ids = [...new Set([ownerId, ...seats.map((s) => s.memberId)])].filter(
    (id) => id !== exceptUserId,
  );
  if (ids.length === 0) return;
  await db.notification.createMany({
    data: ids.map((userId) => ({ userId, type, message })),
  });
}

/** Full admins plus opportunity admins assigned to this job. */
export async function notifyJobStaff(
  db: Db,
  jobId: string,
  type: NotificationType,
  message: string,
): Promise<void> {
  const [supers, delegated] = await Promise.all([
    db.user.findMany({
      where: {
        role: "ADMIN",
        status: "APPROVED",
        OR: [{ adminScope: "SUPER" }, { adminScope: null }],
      },
      select: { id: true },
    }),
    db.eventDelegation.findMany({
      where: { jobId },
      select: { adminId: true },
    }),
  ]);
  const ids = [...new Set([...supers.map((a) => a.id), ...delegated.map((d) => d.adminId)])];
  if (ids.length === 0) return;
  await db.notification.createMany({
    data: ids.map((userId) => ({ userId, type, message })),
  });
}

const REMINDER_WINDOW_MS = 36 * 60 * 60 * 1000;

/** Creates at most one coming-up notice per event when a partner opens the portal. */
export async function ensureUpcomingEventReminders(ownerId: string): Promise<void> {
  const now = new Date();
  const jobs = await prisma.jobOpportunity.findMany({
    where: {
      postedById: ownerId,
      status: { in: ["ACTIVE", "FILLED"] },
      eventStartTime: { gte: now, lte: new Date(now.getTime() + REMINDER_WINDOW_MS) },
    },
    include: { assignedFreelancer: { include: { profile: true } } },
  });
  if (jobs.length === 0) return;

  const memberIds = [
    ownerId,
    ...(
      await prisma.partnerMember.findMany({
        where: { ownerId },
        select: { memberId: true },
      })
    ).map((s) => s.memberId),
  ];
  const existing = await prisma.notification.findMany({
    where: {
      userId: { in: memberIds },
      type: "EVENT_REMINDER",
      createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
    },
    select: { userId: true, message: true },
  });
  const already = new Set(existing.map((n) => `${n.userId}:${n.message}`));

  const rows = jobs.flatMap((job) => {
    const when = formatDateTime(job.eventStartTime);
    const vendor = job.assignedFreelancer?.profile?.name;
    const message = vendor
      ? `"${job.title}" is coming up ${when}. ${vendor} is booked.`
      : `"${job.title}" is coming up ${when}. No vendor hired yet.`;
    return [...new Set(memberIds)]
      .filter((userId) => !already.has(`${userId}:${message}`))
      .map((userId) => ({ userId, type: "EVENT_REMINDER" as const, message }));
  });
  if (rows.length === 0) return;
  await prisma.notification.createMany({ data: rows });
}