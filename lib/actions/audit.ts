"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/auth/guard"

/** Remove audit entries older than `days` (superadmin only). */
export async function purgeAuditLogsOlderThan(days: number) {
  await requirePermission("audit.purge")
  if (!Number.isFinite(days) || days < 30) {
    throw new Error("Retention must be at least 30 days.")
  }
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  const result = await prisma.auditLog.deleteMany({
    where: { createdAt: { lt: cutoff } },
  })
  revalidatePath("/admin/audit")
  return result.count
}
