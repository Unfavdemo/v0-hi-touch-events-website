import type { ReviewerType, Role } from "@/lib/generated/network-prisma/client";

/** Reviews on the network only apply to vendors — not HiTouch admin accounts. */
export function isVendorReviewSubject(user: { role: Role }): boolean {
  return user.role === "FREELANCER";
}

export const VENDOR_RATING_REVIEWER_TYPES = ["INTERNAL_ADMIN", "CLIENT_PARTNER"] as const;
export const PARTNER_RATING_REVIEWER_TYPES = ["HIRED_VENDOR"] as const;

export function isPartnerTargetReview(reviewerType: ReviewerType): boolean {
  return reviewerType === "HIRED_VENDOR";
}

export function isVendorTargetReview(reviewerType: ReviewerType): boolean {
  return reviewerType === "INTERNAL_ADMIN" || reviewerType === "CLIENT_PARTNER";
}
