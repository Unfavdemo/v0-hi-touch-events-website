"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/network/auth";
import type { ActionState } from "@/lib/network/auth-actions";
import { prisma } from "@/lib/network/prisma";
import { firstZodError, vendorBlackoutSchema } from "@/lib/network/validation";

function revalidateBlackouts() {
  revalidatePath("/network/freelancer/calendar");
  revalidatePath("/network/freelancer");
  revalidatePath("/", "layout");
}

export async function createBlackout(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "FREELANCER" || user.status !== "APPROVED") {
    redirect("/network/login");
  }

  const parsed = vendorBlackoutSchema.safeParse({
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt"),
    label: formData.get("label") || undefined,
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };
  const { startAt, endAt, label } = parsed.data;

  await prisma.vendorBlackout.create({
    data: { vendorId: user.id, startAt, endAt, label: label ?? null },
  });
  revalidateBlackouts();
  return { ok: true };
}

export async function deleteBlackout(blackoutId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.role !== "FREELANCER" || user.status !== "APPROVED") {
    redirect("/network/login");
  }

  const row = await prisma.vendorBlackout.findUnique({ where: { id: blackoutId } });
  if (!row || row.vendorId !== user.id) return;

  await prisma.vendorBlackout.delete({ where: { id: blackoutId } });
  revalidateBlackouts();
}
