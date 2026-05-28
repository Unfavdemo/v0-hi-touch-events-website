"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { EventProjectStatus, EventVenueType } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/auth/guard"

function parseVenueType(raw: string): EventVenueType | null {
  const v = raw.trim().toUpperCase()
  if (v === "INDOOR" || v === "OUTDOOR") return v
  return null
}

function parseStatus(raw: string): EventProjectStatus {
  const v = raw.trim().toUpperCase()
  if (v === "PLANNING" || v === "ACTIVE" || v === "COMPLETED" || v === "DRAFT") return v
  return "DRAFT"
}

/** Matches `EventProject.budgetUsd` @db.Decimal(12, 2) — 10 digits before decimal. */
const BUDGET_USD_MAX = 9_999_999_999.99
const GUEST_COUNT_MAX = 2_147_483_647 // PostgreSQL INT max

/** Returns a string Prisma can send to DECIMAL(12,2) without overflow. */
function parseBudgetUsdForDb(raw: string): string | null {
  const cleaned = raw.replace(/[$,\s]/g, "").trim()
  if (!cleaned) return null
  const n = Number(cleaned)
  if (!Number.isFinite(n) || n < 0) return null
  const clamped = Math.min(n, BUDGET_USD_MAX)
  return clamped.toFixed(2)
}

function parseGuestCount(raw: string): number | null {
  const n = Number(raw.trim())
  if (!Number.isFinite(n) || n < 0) return null
  const rounded = Math.round(n)
  if (rounded > GUEST_COUNT_MAX) return GUEST_COUNT_MAX
  return rounded
}

export async function createEventProject(formData: FormData) {
  await requirePermission("projects.write")
  const name = String(formData.get("name") ?? "").trim()
  const notes = String(formData.get("notes") ?? "").trim() || null
  const location = String(formData.get("location") ?? "").trim() || null
  const clientRaw = String(formData.get("hiTouchClientId") ?? "").trim()
  const hiTouchClientId = clientRaw && clientRaw !== "__none__" ? clientRaw : null
  const startsAtRaw = String(formData.get("startsAt") ?? "").trim()
  const endsAtRaw = String(formData.get("endsAt") ?? "").trim()
  const startsAt = startsAtRaw ? new Date(startsAtRaw) : null
  const endsAt = endsAtRaw ? new Date(endsAtRaw) : null
  const venueType = parseVenueType(String(formData.get("venueType") ?? ""))
  const guestCount = parseGuestCount(String(formData.get("guestCount") ?? ""))
  const budgetUsd = parseBudgetUsdForDb(String(formData.get("budgetUsd") ?? ""))

  if (!name) throw new Error("Project name is required.")

  const project = await prisma.eventProject.create({
    data: {
      name,
      notes,
      location,
      hiTouchClientId,
      venueType,
      guestCount,
      ...(budgetUsd !== null ? { budgetUsd } : {}),
      status: "PLANNING",
      startsAt: startsAt && !Number.isNaN(startsAt.getTime()) ? startsAt : null,
      endsAt: endsAt && !Number.isNaN(endsAt.getTime()) ? endsAt : null,
    },
  })

  revalidatePath("/admin/projects")
  redirect(`/admin/projects/${project.id}?step=budget&notice=project_created`)
}

export async function updateEventProject(projectId: string, formData: FormData) {
  await requirePermission("projects.write")
  const name = String(formData.get("name") ?? "").trim()
  const notes = String(formData.get("notes") ?? "").trim() || null
  const location = String(formData.get("location") ?? "").trim() || null
  const clientRaw = String(formData.get("hiTouchClientId") ?? "").trim()
  const hiTouchClientId = clientRaw && clientRaw !== "__none__" ? clientRaw : null
  const startsAtRaw = String(formData.get("startsAt") ?? "").trim()
  const endsAtRaw = String(formData.get("endsAt") ?? "").trim()
  const startsAt = startsAtRaw ? new Date(startsAtRaw) : null
  const endsAt = endsAtRaw ? new Date(endsAtRaw) : null
  const venueType = parseVenueType(String(formData.get("venueType") ?? ""))
  const guestCount = parseGuestCount(String(formData.get("guestCount") ?? ""))
  const status = parseStatus(String(formData.get("status") ?? "DRAFT"))
  const budgetUsd = parseBudgetUsdForDb(String(formData.get("budgetUsd") ?? ""))

  if (!name) throw new Error("Project name is required.")

  await prisma.eventProject.update({
    where: { id: projectId },
    data: {
      name,
      notes,
      location,
      hiTouchClientId,
      venueType,
      guestCount,
      status,
      ...(budgetUsd !== null ? { budgetUsd } : { budgetUsd: null }),
      startsAt: startsAt && !Number.isNaN(startsAt.getTime()) ? startsAt : null,
      endsAt: endsAt && !Number.isNaN(endsAt.getTime()) ? endsAt : null,
    },
  })

  revalidatePath(`/admin/projects/${projectId}`)
  revalidatePath("/admin/projects")
}

export async function updateProjectBudget(projectId: string, formData: FormData) {
  await requirePermission("projects.write")
  const budgetUsd = parseBudgetUsdForDb(String(formData.get("budgetUsd") ?? ""))
  await prisma.eventProject.update({
    where: { id: projectId },
    data: { budgetUsd: budgetUsd ?? null },
  })
  revalidatePath(`/admin/projects/${projectId}`)
}
