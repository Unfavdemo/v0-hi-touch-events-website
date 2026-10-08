"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePartnerOrg } from "@/lib/network/partner-org";
import { prisma } from "@/lib/network/prisma";
import { firstZodError, partnerDocumentRequirementSchema } from "@/lib/network/validation";
import type { ActionState } from "@/lib/network/auth-actions";

function revalidateAll() {
  revalidatePath("/", "layout");
}

export async function addPartnerDocumentRequirement(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { ownerId, isOwner } = await requirePartnerOrg();
  if (!isOwner) return { error: "Only the organization owner can edit required documents." };

  const parsed = partnerDocumentRequirementSchema.safeParse({
    label: formData.get("label"),
    description: formData.get("description"),
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };

  const count = await prisma.partnerDocumentRequirement.count({ where: { partnerId: ownerId } });
  await prisma.partnerDocumentRequirement.create({
    data: {
      partnerId: ownerId,
      label: parsed.data.label,
      description: parsed.data.description || null,
      sortOrder: count,
    },
  });
  revalidateAll();
  return { ok: true };
}

export async function removePartnerDocumentRequirement(requirementId: string): Promise<void> {
  const { ownerId, isOwner } = await requirePartnerOrg();
  if (!isOwner) redirect("/network/partner/organization");

  await prisma.partnerDocumentRequirement.deleteMany({
    where: { id: requirementId, partnerId: ownerId },
  });
  revalidateAll();
}
