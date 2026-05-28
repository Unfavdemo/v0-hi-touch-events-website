"use server"

import { revalidatePath } from "next/cache"
import { AdminRole } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/auth/guard"
import { normalizeAdminRole } from "@/lib/auth/roles"

export async function updateAdminUserRole(adminUserId: string, formData: FormData) {
  const { admin, role: actorRole } = await requirePermission("admin.users.manage")

  const roleRaw = String(formData.get("role") ?? "")
  const role =
    roleRaw === AdminRole.SUPERADMIN ? AdminRole.SUPERADMIN : AdminRole.COORDINATOR

  if (adminUserId === admin.id && role !== AdminRole.SUPERADMIN) {
    throw new Error("You cannot demote your own account.")
  }

  await prisma.adminUser.update({
    where: { id: adminUserId },
    data: { role },
  })

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "admin.role_update",
      entityType: "AdminUser",
      entityId: adminUserId,
      payload: { role, actorRole },
    },
  })

  revalidatePath("/admin/settings/team")
}

export async function listAdminUsers() {
  await requirePermission("admin.users.manage")
  const rows = await prisma.adminUser.findMany({
    orderBy: { createdAt: "asc" },
    include: { user: { select: { email: true, name: true } } },
  })
  return rows.map((r) => ({
    id: r.id,
    email: r.user.email,
    name: r.user.name,
    role: normalizeAdminRole(r.role),
    createdAt: r.createdAt,
  }))
}
