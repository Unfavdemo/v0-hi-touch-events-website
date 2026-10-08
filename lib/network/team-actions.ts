"use server";

import { revalidatePath } from "next/cache";
import { hashPassword } from "@/lib/network/auth";
import type { ActionState } from "@/lib/network/auth-actions";
import { createNotification } from "@/lib/network/notifications";
import { requirePartnerOwner } from "@/lib/network/partner-org";
import { prisma } from "@/lib/network/prisma";
import { eventAdminCreateSchema, firstZodError } from "@/lib/network/validation";

function revalidateTeam() {
  revalidatePath("/network/partner/organization");
  revalidatePath("/", "layout");
}

export async function addPartnerCoordinator(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { user: owner } = await requirePartnerOwner();
  const parsed = eventAdminCreateSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { error: "An account with this email already exists." };

  const member = await prisma.user.create({
    data: {
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password),
      role: "PARTNER",
      status: "APPROVED",
      profile: {
        create: {
          name: parsed.data.name,
          type: "INDIVIDUAL",
          companyName: owner.profile?.companyName ?? undefined,
        },
      },
      partnerOrgSeat: {
        create: { ownerId: owner.id, role: "COORDINATOR" },
      },
    },
  });

  const org = owner.profile?.companyName ?? owner.profile?.name ?? "the organization";
  await createNotification(
    prisma,
    member.id,
    "TEAM_ADDED",
    `You were added to ${org} on HiTouch. Sign in to post opportunities, hire vendors, and message the team.`,
  );

  revalidateTeam();
  return { ok: true };
}

export async function removePartnerCoordinator(memberId: string): Promise<void> {
  const { user: owner } = await requirePartnerOwner();
  if (memberId === owner.id) return;

  const seat = await prisma.partnerMember.findUnique({
    where: { memberId },
    select: { ownerId: true, role: true },
  });
  if (!seat || seat.ownerId !== owner.id || seat.role !== "COORDINATOR") return;

  await prisma.$transaction([
    prisma.partnerMember.delete({ where: { memberId } }),
    prisma.user.update({
      where: { id: memberId },
      data: { status: "SUSPENDED" },
    }),
  ]);

  revalidateTeam();
}
