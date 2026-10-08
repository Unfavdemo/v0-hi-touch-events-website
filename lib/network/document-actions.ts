"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { VendorDocumentKind } from "@/lib/generated/network-prisma/client";
import { getCurrentUser } from "@/lib/network/auth";
import type { ActionState } from "@/lib/network/auth-actions";
import { DocumentError, saveUploadedDocument } from "@/lib/network/vendor-docs";
import { prisma } from "@/lib/network/prisma";

function revalidateDocs(vendorId: string) {
  revalidatePath("/network/freelancer/documents");
  revalidatePath("/network/freelancer/profile");
  revalidatePath("/network/admin/documents");
  revalidatePath(`/network/admin/documents/${vendorId}`);
  revalidatePath("/network/partner/documents");
  revalidatePath(`/network/${vendorId}`);
  revalidatePath("/", "layout");
}

export async function uploadVendorDocument(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "FREELANCER" || user.status !== "APPROVED") {
    redirect("/network/login");
  }

  const kindRaw = String(formData.get("kind") ?? "");
  const kind = kindRaw as VendorDocumentKind;
  if (kind !== "W9" && kind !== "COI" && kind !== "OTHER" && kind !== "PORTFOLIO") {
    return { error: "Pick what kind of document this is." };
  }

  const customLabel = String(formData.get("label") ?? "").trim();
  if ((kind === "OTHER" || kind === "PORTFOLIO") && customLabel.length < 2) {
    return { error: "Give this file a short name, like “business license”." };
  }

  let storedKey: string | undefined;
  try {
    storedKey = await saveUploadedDocument(
      formData.get("file"),
      kind === "W9" ? "W-9" : kind === "COI" ? "HiTouch-COI" : "document",
    );
  } catch (err) {
    return {
      error: err instanceof DocumentError ? err.message : "Could not save that file.",
    };
  }
  if (!storedKey) return { error: "Choose a file to upload." };

  const label =
    kind === "W9"
      ? "Form W-9"
      : kind === "COI"
        ? "HiTouch COI"
        : customLabel;

  if (kind === "W9" || kind === "COI") {
    const existing = await prisma.vendorDocument.findFirst({
      where: { vendorId: user.id, kind },
    });
    const expiresRaw = String(formData.get("expiresAt") ?? "").trim();
    const expiresAt =
      kind === "COI" && expiresRaw ? new Date(`${expiresRaw}T00:00:00`) : undefined;
    if (existing) {
      await prisma.vendorDocument.update({
        where: { id: existing.id },
        data: {
          storedKey,
          label,
          ...(expiresAt && !Number.isNaN(expiresAt.getTime()) ? { expiresAt } : {}),
        },
      });
    } else {
      await prisma.vendorDocument.create({
        data: {
          vendorId: user.id,
          kind,
          label,
          storedKey,
          ...(expiresAt && !Number.isNaN(expiresAt.getTime()) ? { expiresAt } : {}),
        },
      });
    }
    if (kind === "W9") {
      await prisma.profile.update({
        where: { userId: user.id },
        data: { w9Url: storedKey },
      });
    }
  } else {
    await prisma.vendorDocument.create({
      data: { vendorId: user.id, kind, label: kind === "PORTFOLIO" ? customLabel : label, storedKey },
    });
  }

  revalidateDocs(user.id);
  revalidatePath(`/network/${user.id}`);
  return { ok: true };
}

export async function deleteVendorDocument(documentId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.role !== "FREELANCER" || user.status !== "APPROVED") {
    redirect("/network/login");
  }

  const doc = await prisma.vendorDocument.findUnique({ where: { id: documentId } });
  if (!doc || doc.vendorId !== user.id) return;
  if (doc.kind !== "OTHER" && doc.kind !== "PORTFOLIO") return;

  await prisma.vendorDocument.delete({ where: { id: documentId } });
  revalidateDocs(user.id);
}
