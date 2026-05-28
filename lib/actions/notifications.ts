"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/auth/guard"

export async function markNotificationRead(id: string) {
  await requirePermission("notifications.write")
  await prisma.adminNotification.update({
    where: { id },
    data: { readAt: new Date() },
  })
  revalidatePath("/admin/notifications")
}

export async function markAllNotificationsRead() {
  await requirePermission("notifications.write")
  await prisma.adminNotification.updateMany({
    where: { readAt: null },
    data: { readAt: new Date() },
  })
  revalidatePath("/admin/notifications")
}
