import { redirect } from "next/navigation";
import type { SessionUser } from "@/lib/network/auth";
import { getCurrentUser, requireUser } from "@/lib/network/auth";
import { prisma } from "@/lib/network/prisma";

export interface PartnerOrg {
  user: SessionUser;
  ownerId: string;
  isOwner: boolean;
}

export async function partnerOwnerId(userId: string): Promise<string> {
  const seat = await prisma.partnerMember.findUnique({
    where: { memberId: userId },
    select: { ownerId: true },
  });
  return seat?.ownerId ?? userId;
}

export async function partnerOrgMemberIds(ownerId: string): Promise<string[]> {
  const seats = await prisma.partnerMember.findMany({
    where: { ownerId },
    select: { memberId: true },
  });
  return [...new Set([ownerId, ...seats.map((s) => s.memberId)])];
}

export async function isPartnerOrgMember(userId: string, ownerId: string): Promise<boolean> {
  if (userId === ownerId) return true;
  const seat = await prisma.partnerMember.findUnique({
    where: { memberId: userId },
    select: { ownerId: true },
  });
  return seat?.ownerId === ownerId;
}

export async function requirePartnerOrg(): Promise<PartnerOrg> {
  const user = await requireUser("PARTNER");
  const ownerId = await partnerOwnerId(user.id);
  return { user, ownerId, isOwner: ownerId === user.id };
}

export async function requirePartnerOwner(): Promise<PartnerOrg> {
  const org = await requirePartnerOrg();
  if (!org.isOwner) {
    redirect("/network/partner/organization");
  }
  return org;
}

/** Partner session for server actions. Redirects if not an approved partner. */
export async function requirePartnerAction(): Promise<PartnerOrg> {
  const user = await getCurrentUser();
  if (!user || user.role !== "PARTNER" || user.status !== "APPROVED") {
    redirect("/network/login");
  }
  const ownerId = await partnerOwnerId(user.id);
  return { user, ownerId, isOwner: ownerId === user.id };
}
