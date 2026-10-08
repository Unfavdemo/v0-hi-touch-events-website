"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/network/prisma";
import { requirePartnerAction } from "@/lib/network/partner-org";

function revalidateRoster() {
  revalidatePath("/network/partner/roster");
  revalidatePath("/network/partner/vendors");
  revalidatePath("/", "layout");
}

async function requirePartner() {
  return requirePartnerAction();
}

async function requireApprovedVendor(vendorId: string) {
  const vendor = await prisma.user.findUnique({
    where: { id: vendorId },
    select: { id: true, role: true, status: true },
  });
  if (!vendor || vendor.role !== "FREELANCER" || vendor.status !== "APPROVED") {
    return null;
  }
  return vendor;
}

export async function favoriteVendor(vendorId: string): Promise<void> {
  const { ownerId } = await requirePartner();
  if (!(await requireApprovedVendor(vendorId))) return;
  await prisma.partnerVendor.upsert({
    where: { partnerId_vendorId: { partnerId: ownerId, vendorId } },
    create: { partnerId: ownerId, vendorId, favorite: true, blocked: false },
    update: { favorite: true, blocked: false },
  });
  revalidateRoster();
}

export async function unfavoriteVendor(vendorId: string): Promise<void> {
  const { ownerId } = await requirePartner();
  await prisma.partnerVendor.updateMany({
    where: { partnerId: ownerId, vendorId },
    data: { favorite: false },
  });
  revalidateRoster();
}

export async function blockVendor(vendorId: string): Promise<void> {
  const { ownerId } = await requirePartner();
  if (!(await requireApprovedVendor(vendorId))) return;
  await prisma.partnerVendor.upsert({
    where: { partnerId_vendorId: { partnerId: ownerId, vendorId } },
    create: { partnerId: ownerId, vendorId, favorite: false, blocked: true },
    update: { favorite: false, blocked: true },
  });
  revalidateRoster();
}

export async function unblockVendor(vendorId: string): Promise<void> {
  const { ownerId } = await requirePartner();
  await prisma.partnerVendor.updateMany({
    where: { partnerId: ownerId, vendorId },
    data: { blocked: false },
  });
  revalidateRoster();
}
