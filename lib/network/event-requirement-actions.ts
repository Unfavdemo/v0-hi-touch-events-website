"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/network/auth";
import type { ActionState } from "@/lib/network/auth-actions";
import { canManagePartnerEvent } from "@/lib/network/event-organizer";
import { prisma } from "@/lib/network/prisma";
import { firstZodError, jobDocumentRequirementSchema } from "@/lib/network/validation";

function revalidateAll() {
  revalidatePath("/", "layout");
}

export async function addEventDocumentRequirement(
  eventId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || user.status !== "APPROVED") redirect("/network/login");
  if (!(await canManagePartnerEvent(user, eventId))) {
    return { error: "Event not found." };
  }

  const parsed = jobDocumentRequirementSchema.safeParse({
    label: formData.get("label"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };

  const label = parsed.data.label.trim();
  const dup = await prisma.eventDocumentRequirement.findFirst({
    where: {
      eventId,
      kind: "CUSTOM",
      customLabel: { equals: label, mode: "insensitive" },
    },
  });
  if (dup) return { error: "That requirement is already on this event." };

  await prisma.eventDocumentRequirement.create({
    data: {
      eventId,
      kind: "CUSTOM",
      customLabel: label,
      customDescription: parsed.data.description?.trim() || null,
    },
  });
  revalidateAll();
  return { ok: true };
}

export async function removeEventDocumentRequirement(requirementId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.status !== "APPROVED") redirect("/network/login");

  const row = await prisma.eventDocumentRequirement.findUnique({
    where: { id: requirementId },
    select: { eventId: true },
  });
  if (!row || !(await canManagePartnerEvent(user, row.eventId))) return;

  await prisma.eventDocumentRequirement.delete({ where: { id: requirementId } });
  revalidateAll();
}

export async function addEventDocumentFromTemplateAction(
  eventId: string,
  partnerRequirementId: string,
): Promise<void> {
  const result = await addEventDocumentFromTemplate(eventId, partnerRequirementId);
  if (result.error) return;
}

async function addEventDocumentFromTemplate(
  eventId: string,
  partnerRequirementId: string,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || user.status !== "APPROVED") redirect("/network/login");
  if (!(await canManagePartnerEvent(user, eventId))) {
    return { error: "Event not found." };
  }

  const event = await prisma.partnerEvent.findUnique({
    where: { id: eventId },
    select: { partnerId: true },
  });
  if (!event) return { error: "Event not found." };

  const template = await prisma.partnerDocumentRequirement.findFirst({
    where: { id: partnerRequirementId, partnerId: event.partnerId },
  });
  if (!template) return { error: "Template not found." };

  const existing = await prisma.eventDocumentRequirement.findFirst({
    where: { eventId, partnerRequirementId: template.id },
  });
  if (existing) return { error: "That template is already on this event." };

  await prisma.eventDocumentRequirement.create({
    data: {
      eventId,
      kind: "CUSTOM",
      customLabel: template.label,
      customDescription: template.description,
      partnerRequirementId: template.id,
    },
  });
  revalidateAll();
  return { ok: true };
}
