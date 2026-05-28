"use server"

import { revalidatePath } from "next/cache"
import { DealStage } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/auth/guard"
import { DEAL_STAGES, type DealStageName } from "@/lib/crm/deal-stages"

function parseStage(raw: string): DealStage {
  if (DEAL_STAGES.includes(raw as DealStageName)) return raw as DealStage
  throw new Error("Invalid deal stage.")
}

function parseAmount(raw: string): number | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const n = Number.parseFloat(trimmed.replace(/[$,]/g, ""))
  if (!Number.isFinite(n) || n < 0) throw new Error("Invalid amount.")
  return n
}

export async function createDeal(formData: FormData) {
  const { admin } = await requirePermission("deals.write")
  const name = String(formData.get("name") ?? "").trim()
  if (!name) throw new Error("Deal name is required.")

  const contactId = String(formData.get("contactId") ?? "").trim() || null
  const companyId = String(formData.get("companyId") ?? "").trim() || null
  const hiTouchClientId = String(formData.get("hiTouchClientId") ?? "").trim() || null
  const closeDateRaw = String(formData.get("closeDate") ?? "").trim()
  const closeDate = closeDateRaw ? new Date(closeDateRaw) : null

  const deal = await prisma.deal.create({
    data: {
      name,
      stage: DealStage.LEAD,
      amount: parseAmount(String(formData.get("amount") ?? "")),
      contactId,
      companyId,
      hiTouchClientId,
      closeDate: closeDate && !Number.isNaN(closeDate.getTime()) ? closeDate : null,
      ownerId: admin.id,
      notes: String(formData.get("notes") ?? "").trim() || null,
    },
  })

  revalidatePath("/admin/deals")
  revalidatePath("/admin")
  void deal
}

export async function updateDealStage(dealId: string, stageRaw: string) {
  await requirePermission("deals.write")
  const stage = parseStage(stageRaw)

  await prisma.deal.update({
    where: { id: dealId },
    data: { stage, stageEnteredAt: new Date() },
  })

  revalidatePath("/admin/deals")
  revalidatePath(`/admin/deals/${dealId}`)
  revalidatePath("/admin")
}

export async function updateDeal(dealId: string, formData: FormData) {
  await requirePermission("deals.write")
  const name = String(formData.get("name") ?? "").trim()
  if (!name) throw new Error("Deal name is required.")

  const closeDateRaw = String(formData.get("closeDate") ?? "").trim()
  const closeDate = closeDateRaw ? new Date(closeDateRaw) : null
  const ownerId = String(formData.get("ownerId") ?? "").trim() || null

  await prisma.deal.update({
    where: { id: dealId },
    data: {
      name,
      stage: parseStage(String(formData.get("stage") ?? DealStage.LEAD)),
      amount: parseAmount(String(formData.get("amount") ?? "")),
      contactId: String(formData.get("contactId") ?? "").trim() || null,
      companyId: String(formData.get("companyId") ?? "").trim() || null,
      hiTouchClientId: String(formData.get("hiTouchClientId") ?? "").trim() || null,
      closeDate: closeDate && !Number.isNaN(closeDate.getTime()) ? closeDate : null,
      ownerId,
      notes: String(formData.get("notes") ?? "").trim() || null,
    },
  })

  revalidatePath("/admin/deals")
  revalidatePath(`/admin/deals/${dealId}`)
}

export async function deleteDeal(dealId: string) {
  await requirePermission("deals.write")
  await prisma.deal.delete({ where: { id: dealId } })
  revalidatePath("/admin/deals")
  revalidatePath("/admin")
}
