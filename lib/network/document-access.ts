import type { VendorDocumentKind } from "@/lib/generated/network-prisma/client";
import type { SessionUser } from "@/lib/network/auth";
import { partnerOwnerId } from "@/lib/network/partner-org";
import { prisma } from "@/lib/network/prisma";

export async function partnerHasHiredVendor(
  partnerId: string,
  vendorId: string,
): Promise<boolean> {
  const count = await prisma.jobOpportunity.count({
    where: {
      postedById: partnerId,
      assignedFreelancerId: vendorId,
      status: { in: ["FILLED", "COMPLETED"] },
    },
  });
  return count > 0;
}

/** Who may open a stored vendor file. Other vendors never can. Partners see W-9 and COI after a hire. */
export async function canViewVendorDocument(options: {
  viewer: SessionUser | null;
  vendorId: string;
  kind: VendorDocumentKind;
}): Promise<boolean> {
  const { viewer, vendorId, kind } = options;

  if (kind === "PORTFOLIO") {
    const vendor = await prisma.user.findUnique({
      where: { id: vendorId },
      select: { role: true, status: true },
    });
    return vendor?.role === "FREELANCER" && vendor.status === "APPROVED";
  }

  if (!viewer) return false;
  if (viewer.role === "ADMIN") {
    if (viewer.adminScope !== "EVENT") return true;
    const n = await prisma.eventDelegation.count({
      where: {
        adminId: viewer.id,
        job: {
          OR: [
            { assignedFreelancerId: vendorId },
            { bids: { some: { freelancerId: vendorId } } },
            { invites: { some: { freelancerId: vendorId } } },
          ],
        },
      },
    });
    return n > 0;
  }
  if (viewer.id === vendorId) return true;
  if (viewer.role === "FREELANCER") return false;
  if (viewer.role === "PARTNER" && (kind === "W9" || kind === "COI")) {
    const ownerId = await partnerOwnerId(viewer.id);
    return partnerHasHiredVendor(ownerId, vendorId);
  }
  return false;
}

export function documentKindLabel(kind: VendorDocumentKind): string {
  switch (kind) {
    case "W9":
      return "Form W-9";
    case "COI":
      return "HiTouch COI";
    case "OTHER":
      return "Other document";
    case "PORTFOLIO":
      return "Portfolio";
  }
}
