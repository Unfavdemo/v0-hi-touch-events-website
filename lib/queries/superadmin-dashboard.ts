import { PendingStatus } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { getCrmDashboardStats } from "@/lib/queries/crm-dashboard"

/** Organization-wide metrics for Master Admin home. */
export async function getSuperAdminDashboard() {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [stats, pending, contacts, projects, adminUsers, auditWeek, unreadNotifications] = await Promise.all([
    getCrmDashboardStats(),
    prisma.pendingSubmission.count({ where: { status: PendingStatus.PENDING } }),
    prisma.contact.count(),
    prisma.eventProject.count(),
    prisma.adminUser.count(),
    prisma.auditLog.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.adminNotification.count({ where: { readAt: null } }),
  ])

  return {
    stats,
    pending,
    contacts,
    projects,
    adminUsers,
    auditWeek,
    unreadNotifications,
  }
}
