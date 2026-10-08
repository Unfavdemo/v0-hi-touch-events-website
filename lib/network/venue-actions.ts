"use server";

import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/network/auth-actions";
import { prisma } from "@/lib/network/prisma";
import { firstZodError, savedVenueSchema } from "@/lib/network/validation";
import { requirePartnerAction } from "@/lib/network/partner-org";

function revalidateVenues() {
  revalidatePath("/network/partner/organization");
  revalidatePath("/network/partner/jobs/new");
  revalidatePath("/", "layout");
}

async function requirePartner() {
  return requirePartnerAction();
}

function parseVenue(formData: FormData) {
  return savedVenueSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address"),
    notes: formData.get("notes") || undefined,
    contactName: formData.get("contactName") || undefined,
    contactPhone: formData.get("contactPhone") || undefined,
  });
}

export async function createVenue(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { ownerId } = await requirePartner();
  const parsed = parseVenue(formData);
  if (!parsed.success) return { error: firstZodError(parsed.error) };
  const input = parsed.data;

  await prisma.savedVenue.create({
    data: {
      partnerId: ownerId,
      name: input.name,
      address: input.address,
      notes: input.notes ?? null,
      contactName: input.contactName ?? null,
      contactPhone: input.contactPhone ?? null,
    },
  });
  revalidateVenues();
  return { ok: true };
}

export async function updateVenue(
  venueId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { ownerId } = await requirePartner();
  const parsed = parseVenue(formData);
  if (!parsed.success) return { error: firstZodError(parsed.error) };
  const input = parsed.data;

  const result = await prisma.savedVenue.updateMany({
    where: { id: venueId, partnerId: ownerId },
    data: {
      name: input.name,
      address: input.address,
      notes: input.notes ?? null,
      contactName: input.contactName ?? null,
      contactPhone: input.contactPhone ?? null,
    },
  });
  if (result.count === 0) return { error: "That venue isn't on your list." };
  revalidateVenues();
  return { ok: true };
}

export async function deleteVenue(venueId: string): Promise<void> {
  const { ownerId } = await requirePartner();
  await prisma.savedVenue.deleteMany({ where: { id: venueId, partnerId: ownerId } });
  revalidateVenues();
}
