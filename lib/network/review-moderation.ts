"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAdminAction } from "@/lib/network/admin-log";
import { canManageJob, isSuperAdmin } from "@/lib/network/admin-rbac";
import { getCurrentUser } from "@/lib/network/auth";
import { prisma } from "@/lib/network/prisma";
import { recomputePartnerRating, recomputeVendorRating } from "@/lib/network/rating-core";
import { isPartnerTargetReview, isVendorTargetReview } from "@/lib/network/review-policy";

function revalidateAll() {
  revalidatePath("/", "layout");
}

export async function setReviewHidden(reviewId: string, hidden: boolean): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.status !== "APPROVED" || user.role !== "ADMIN") redirect("/network/login");

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      job: true,
      freelancer: { include: { profile: true } },
    },
  });
  if (!review) return;
  if (!(await canManageJob(user, review.job)) && !isSuperAdmin(user)) return;

  await prisma.$transaction(async (tx) => {
    await tx.review.update({
      where: { id: reviewId },
      data: hidden
        ? { hiddenAt: new Date(), hiddenById: user.id }
        : { hiddenAt: null, hiddenById: null },
    });
    if (isPartnerTargetReview(review.reviewerType)) {
      await recomputePartnerRating(tx, review.freelancerId);
    } else if (isVendorTargetReview(review.reviewerType)) {
      await recomputeVendorRating(
        tx,
        review.freelancerId,
        review.freelancer.profile?.name ?? "This vendor",
        { notifyOnCross: false },
      );
    }
    const subjectLabel =
      review.reviewerType === "HIRED_VENDOR"
        ? "partner"
        : (review.freelancer.profile?.name ?? "vendor");
    await logAdminAction(tx, {
      actorId: user.id,
      action: hidden ? "HIDE_REVIEW" : "UNHIDE_REVIEW",
      targetType: "review",
      targetId: reviewId,
      message: `${hidden ? "Hid" : "Restored"} a review for ${subjectLabel} on "${review.job.title}"`,
    });
  });

  revalidateAll();
}
