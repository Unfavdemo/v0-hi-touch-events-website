"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { IncidentKind } from "@/lib/generated/network-prisma/client";
import { logAdminAction } from "@/lib/network/admin-log";
import type { ActionState } from "@/lib/network/auth-actions";
import { getCurrentUser } from "@/lib/network/auth";
import {
  assertCanManageVendorForIncident,
  canManageIncident,
} from "@/lib/network/incident-access";
import { prisma } from "@/lib/network/prisma";
import { firstZodError, incidentSchema, incidentUpdateSchema } from "@/lib/network/validation";

function revalidateAll() {
  revalidatePath("/", "layout");
}

export async function createIncident(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const actor = await getCurrentUser();
  if (!actor || actor.status !== "APPROVED" || actor.role !== "ADMIN") redirect("/network/login");

  const parsed = incidentSchema.safeParse({
    vendorId: formData.get("vendorId"),
    jobId: formData.get("jobId") || undefined,
    kind: formData.get("kind"),
    notes: formData.get("notes"),
    flagForDismissal: formData.get("flagForDismissal") === "on",
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };

  const access = await assertCanManageVendorForIncident(
    actor,
    parsed.data.vendorId,
    parsed.data.jobId,
  );
  if (!access.ok) return { error: access.error };

  const vendor = await prisma.user.findUnique({
    where: { id: parsed.data.vendorId, role: "FREELANCER" },
    include: { profile: true },
  });
  if (!vendor) return { error: "Pick a vendor." };

  let jobTitle: string | null = null;
  if (parsed.data.jobId) {
    const job = await prisma.jobOpportunity.findUnique({ where: { id: parsed.data.jobId } });
    if (!job) return { error: "That opportunity was not found." };
    jobTitle = job.title;
  }

  const incident = await prisma.incident.create({
    data: {
      vendorId: parsed.data.vendorId,
      jobId: parsed.data.jobId ?? null,
      reporterId: actor.id,
      kind: parsed.data.kind as IncidentKind,
      notes: parsed.data.notes,
    },
  });

  if (parsed.data.flagForDismissal) {
    await prisma.profile.update({
      where: { userId: vendor.id },
      data: { flaggedForDismissal: true },
    });
  }

  await logAdminAction(prisma, {
    actorId: actor.id,
    action: "CREATE_INCIDENT",
    targetType: "incident",
    targetId: incident.id,
    message: `Logged ${parsed.data.kind} for ${vendor.profile?.name ?? vendor.email}${jobTitle ? ` on "${jobTitle}"` : ""}`,
  });
  revalidateAll();
  return { ok: true };
}

export async function updateIncident(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const actor = await getCurrentUser();
  if (!actor || actor.status !== "APPROVED" || actor.role !== "ADMIN") redirect("/network/login");

  const parsed = incidentUpdateSchema.safeParse({
    incidentId: formData.get("incidentId"),
    jobId: formData.get("jobId") ?? "",
    kind: formData.get("kind"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };

  if (!(await canManageIncident(actor, parsed.data.incidentId))) {
    return { error: "You cannot edit this incident." };
  }

  const existing = await prisma.incident.findUnique({
    where: { id: parsed.data.incidentId },
    include: { vendor: { include: { profile: true } }, job: true },
  });
  if (!existing || existing.voidedAt) return { error: "That incident is no longer active." };

  const jobId = parsed.data.jobId ? parsed.data.jobId : null;
  if (jobId) {
    const job = await prisma.jobOpportunity.findUnique({ where: { id: jobId } });
    if (!job) return { error: "That opportunity was not found." };
    if (job.assignedFreelancerId !== existing.vendorId) {
      return { error: "That opportunity is not tied to this vendor." };
    }
  }

  await prisma.incident.update({
    where: { id: parsed.data.incidentId },
    data: {
      kind: parsed.data.kind as IncidentKind,
      notes: parsed.data.notes,
      jobId,
    },
  });

  await logAdminAction(prisma, {
    actorId: actor.id,
    action: "UPDATE_INCIDENT",
    targetType: "incident",
    targetId: existing.id,
    message: `Updated ${parsed.data.kind} for ${existing.vendor.profile?.name ?? existing.vendor.email}`,
  });
  revalidateAll();
  return { ok: true };
}

export async function voidIncident(incidentId: string): Promise<ActionState> {
  const actor = await getCurrentUser();
  if (!actor || actor.status !== "APPROVED" || actor.role !== "ADMIN") redirect("/network/login");

  if (!(await canManageIncident(actor, incidentId))) {
    return { error: "You cannot undo this incident." };
  }

  const existing = await prisma.incident.findUnique({
    where: { id: incidentId },
    include: { vendor: { include: { profile: true } }, job: true },
  });
  if (!existing) return { error: "Incident not found." };
  if (existing.voidedAt) return { error: "This incident was already undone." };

  await prisma.incident.update({
    where: { id: incidentId },
    data: { voidedAt: new Date(), voidedById: actor.id },
  });

  await logAdminAction(prisma, {
    actorId: actor.id,
    action: "VOID_INCIDENT",
    targetType: "incident",
    targetId: incidentId,
    message: `Undid ${existing.kind} for ${existing.vendor.profile?.name ?? existing.vendor.email}${existing.job ? ` on "${existing.job.title}"` : ""}`,
  });
  revalidateAll();
  return { ok: true };
}

export async function restoreIncident(incidentId: string): Promise<ActionState> {
  const actor = await getCurrentUser();
  if (!actor || actor.status !== "APPROVED" || actor.role !== "ADMIN") redirect("/network/login");

  if (!(await canManageIncident(actor, incidentId))) {
    return { error: "You cannot restore this incident." };
  }

  const existing = await prisma.incident.findUnique({
    where: { id: incidentId },
    include: { vendor: { include: { profile: true } }, job: true },
  });
  if (!existing) return { error: "Incident not found." };
  if (!existing.voidedAt) return { error: "This incident is already active." };

  await prisma.incident.update({
    where: { id: incidentId },
    data: { voidedAt: null, voidedById: null },
  });

  await logAdminAction(prisma, {
    actorId: actor.id,
    action: "RESTORE_INCIDENT",
    targetType: "incident",
    targetId: incidentId,
    message: `Restored ${existing.kind} for ${existing.vendor.profile?.name ?? existing.vendor.email}`,
  });
  revalidateAll();
  return { ok: true };
}
