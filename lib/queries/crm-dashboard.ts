import { DealStage, TaskStatus } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { OPEN_DEAL_STAGES, type DealStageName } from "@/lib/crm/deal-stages"

export async function getCrmDashboardStats() {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const [openDeals, pipelineAgg, wonDeals, tasksDueToday, tasksOverdue, openTasks, lists] = await Promise.all([
    prisma.deal.count({ where: { stage: { in: OPEN_DEAL_STAGES as DealStage[] } } }),
    prisma.deal.aggregate({
      where: { stage: { in: OPEN_DEAL_STAGES as DealStage[] } },
      _sum: { amount: true },
    }),
    prisma.deal.count({ where: { stage: DealStage.CLOSED_WON } }),
    prisma.crmTask.count({
      where: {
        status: { not: TaskStatus.COMPLETED },
        dueAt: { gte: startOfToday, lt: new Date(startOfToday.getTime() + 86400000) },
      },
    }),
    prisma.crmTask.count({
      where: {
        status: { not: TaskStatus.COMPLETED },
        dueAt: { lt: startOfToday },
      },
    }),
    prisma.crmTask.count({ where: { status: { not: TaskStatus.COMPLETED } } }),
    prisma.contactList.count(),
  ])

  const dealsByStage = await prisma.deal.groupBy({
    by: ["stage"],
    _count: { id: true },
    _sum: { amount: true },
  })

  return {
    openDeals,
    pipelineValue: pipelineAgg._sum.amount,
    wonDeals,
    tasksDueToday,
    tasksOverdue,
    openTasks,
    lists,
    dealsByStage,
  }
}

export async function getDealsByStage() {
  const deals = await prisma.deal.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      contact: { select: { id: true, email: true, firstName: true, lastName: true } },
      company: { select: { id: true, name: true } },
      owner: { include: { user: { select: { email: true, name: true } } } },
    },
  })

  return deals
}
