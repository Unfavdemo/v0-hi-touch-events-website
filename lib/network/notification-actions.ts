"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/network/auth";
import { prisma } from "@/lib/network/prisma";

export async function markNotificationRead(notificationId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  await prisma.notification.updateMany({
    where: { id: notificationId, userId: user.id },
    data: { isRead: true },
  });
  revalidatePath("/", "layout");
}

export async function markAllNotificationsRead(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  });
  revalidatePath("/", "layout");
}
