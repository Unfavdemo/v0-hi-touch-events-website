"use server"

import { revalidatePath } from "next/cache"
import { TaskPriority, TaskStatus } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/auth/guard"

function parseStatus(raw: string): TaskStatus {
  if (Object.values(TaskStatus).includes(raw as TaskStatus)) return raw as TaskStatus
  throw new Error("Invalid task status.")
}

function parsePriority(raw: string): TaskPriority {
  if (Object.values(TaskPriority).includes(raw as TaskPriority)) return raw as TaskPriority
  throw new Error("Invalid priority.")
}

export async function createTask(formData: FormData) {
  const { admin } = await requirePermission("tasks.write")
  const title = String(formData.get("title") ?? "").trim()
  if (!title) throw new Error("Task title is required.")

  const dueRaw = String(formData.get("dueAt") ?? "").trim()
  const dueAt = dueRaw ? new Date(dueRaw) : null

  await prisma.crmTask.create({
    data: {
      title,
      body: String(formData.get("body") ?? "").trim() || null,
      priority: parsePriority(String(formData.get("priority") ?? TaskPriority.MEDIUM)),
      dueAt: dueAt && !Number.isNaN(dueAt.getTime()) ? dueAt : null,
      contactId: String(formData.get("contactId") ?? "").trim() || null,
      companyId: String(formData.get("companyId") ?? "").trim() || null,
      dealId: String(formData.get("dealId") ?? "").trim() || null,
      assignedToId: String(formData.get("assignedToId") ?? "").trim() || admin.id,
      createdById: admin.id,
    },
  })

  revalidatePath("/admin/tasks")
  revalidatePath("/admin")
}

export async function updateTaskStatus(taskId: string, statusRaw: string) {
  await requirePermission("tasks.write")
  const status = parseStatus(statusRaw)
  await prisma.crmTask.update({
    where: { id: taskId },
    data: {
      status,
      completedAt: status === TaskStatus.COMPLETED ? new Date() : null,
    },
  })
  revalidatePath("/admin/tasks")
  revalidatePath("/admin")
}

export async function deleteTask(taskId: string) {
  await requirePermission("tasks.write")
  await prisma.crmTask.delete({ where: { id: taskId } })
  revalidatePath("/admin/tasks")
  revalidatePath("/admin")
}
