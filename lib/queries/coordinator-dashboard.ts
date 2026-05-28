import {
  DealStage,
  EventProjectStatus,
  PendingStatus,
  TaskStatus,
} from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"

export type CoordinatorDashboardTask = {
  id: string
  title: string
  dueAt: Date | null
  dealId: string | null
  dealName: string | null
}

const CLOSED_STAGES: DealStage[] = [DealStage.CLOSED_WON, DealStage.CLOSED_LOST]

/**
 * Operational dashboard for Event Coordinators: work assigned to this admin + team queue signals.
 */
export async function getCoordinatorDashboard(userId: string) {
  const admin = await prisma.adminUser.findUnique({
    where: { userId },
    select: { id: true },
  })

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfToday = new Date(startOfToday.getTime() + 86400000)

  if (!admin) {
    return {
      pendingIntake: 0,
      myOpenTasks: 0,
      myOverdueTasks: 0,
      myDueTodayTasks: 0,
      myOpenDeals: 0,
      myActiveProjects: 0,
      unassignedOpenTasks: 0,
      allOpenDeals: 0,
      unreadNotifications: 0,
      upcomingTasks: [] as CoordinatorDashboardTask[],
    }
  }

  const [
    pendingIntake,
    myOpenTasks,
    myOverdueTasks,
    myDueTodayTasks,
    myOpenDeals,
    myActiveProjects,
    unassignedOpenTasks,
    allOpenDeals,
    unreadNotifications,
    upcomingTasks,
  ] = await Promise.all([
    prisma.pendingSubmission.count({ where: { status: PendingStatus.PENDING } }),
    prisma.crmTask.count({
      where: { assignedToId: admin.id, status: { not: TaskStatus.COMPLETED } },
    }),
    prisma.crmTask.count({
      where: {
        assignedToId: admin.id,
        status: { not: TaskStatus.COMPLETED },
        dueAt: { lt: startOfToday },
      },
    }),
    prisma.crmTask.count({
      where: {
        assignedToId: admin.id,
        status: { not: TaskStatus.COMPLETED },
        dueAt: { gte: startOfToday, lt: endOfToday },
      },
    }),
    prisma.deal.count({
      where: { ownerId: admin.id, stage: { notIn: CLOSED_STAGES } },
    }),
    prisma.eventProject.count({
      where: {
        status: { not: EventProjectStatus.COMPLETED },
        deals: { some: { ownerId: admin.id } },
      },
    }),
    prisma.crmTask.count({
      where: { assignedToId: null, status: { not: TaskStatus.COMPLETED } },
    }),
    prisma.deal.count({ where: { stage: { notIn: CLOSED_STAGES } } }),
    prisma.adminNotification.count({ where: { readAt: null } }),
    prisma.crmTask.findMany({
      where: { assignedToId: admin.id, status: { not: TaskStatus.COMPLETED } },
      orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
      take: 6,
      select: {
        id: true,
        title: true,
        dueAt: true,
        dealId: true,
        deal: { select: { name: true } },
      },
    }),
  ])

  return {
    pendingIntake,
    myOpenTasks,
    myOverdueTasks,
    myDueTodayTasks,
    myOpenDeals,
    myActiveProjects,
    unassignedOpenTasks,
    allOpenDeals,
    unreadNotifications,
    upcomingTasks: upcomingTasks.map((t) => ({
      id: t.id,
      title: t.title,
      dueAt: t.dueAt,
      dealId: t.dealId,
      dealName: t.deal?.name ?? null,
    })),
  }
}
