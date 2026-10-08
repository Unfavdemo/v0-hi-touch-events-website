"use server";

import { revalidatePath } from "next/cache";
import { logAdminAction } from "@/lib/network/admin-log";
import { requireSuperAdmin } from "@/lib/network/admin-rbac";
import { prisma } from "@/lib/network/prisma";

export async function setDocumentExpiry(documentId: string, formData: FormData): Promise<void> {
  const actor = await requireSuperAdmin();
  const raw = String(formData.get("expiresAt") ?? "").trim();
  const expiresAt = raw ? new Date(`${raw}T00:00:00`) : null;
  if (expiresAt && Number.isNaN(expiresAt.getTime())) return;

  const doc = await prisma.vendorDocument.update({
    where: { id: documentId },
    data: { expiresAt },
    include: { vendor: { include: { profile: true } } },
  });
  await logAdminAction(prisma, {
    actorId: actor.id,
    action: "SET_DOCUMENT_EXPIRY",
    targetType: "document",
    targetId: documentId,
    message: `Set ${doc.label} expiry for ${doc.vendor.profile?.name ?? doc.vendor.email}`,
  });
  revalidatePath("/", "layout");
}
