import type { ReviewerType } from "@/lib/generated/network-prisma/client";
import type { Prisma, PrismaClient } from "@/lib/generated/network-prisma/client";
import { createNotification, notifyAdmins } from "@/lib/network/notifications";
import { getPlatformSettings } from "@/lib/network/platform-settings";
import { prisma } from "@/lib/network/prisma";
import {
  PARTNER_RATING_REVIEWER_TYPES,
  VENDOR_RATING_REVIEWER_TYPES,
} from "@/lib/network/review-policy";

/** Shown ratings only — hidden reviews stay in the table but drop out of averages. */
export const VISIBLE_REVIEW: Prisma.ReviewWhereInput = { hiddenAt: null };

export const WARNING_THRESHOLD = 3.5;
export const DISMISSAL_THRESHOLD = 3.0;

type Db = PrismaClient | Prisma.TransactionClient;

export interface RecordReviewParams {
  jobId: string;
  /** User being rated (vendor for admin/partner reviews; partner for vendor reviews). */
  subjectUserId: string;
  subjectName: string;
  reviewerId: string;
  reviewerType: ReviewerType;
  stars: number;
  feedback: string;
}

export async function recomputeVendorRating(
  db: Db,
  freelancerId: string,
  freelancerName: string,
  options?: { notifyOnCross?: boolean; prevAvg?: number | null },
): Promise<{ newAvg: number; count: number; flagged: boolean }> {
  const settings = await getPlatformSettings(db);
  const profile = await db.profile.findUnique({
    where: { userId: freelancerId },
    select: { ratingAvg: true },
  });
  const prevAvg = options?.prevAvg ?? profile?.ratingAvg ?? null;

  const agg = await db.review.aggregate({
    where: {
      freelancerId,
      hiddenAt: null,
      reviewerType: { in: [...VENDOR_RATING_REVIEWER_TYPES] },
    },
    _avg: { stars: true },
    _count: { _all: true },
  });
  const count = agg._count._all;
  const newAvg = count === 0 ? 0 : (agg._avg.stars ?? 0);
  const flagged = count > 0 && newAvg < settings.dismissalThreshold;

  await db.profile.update({
    where: { userId: freelancerId },
    data: {
      ratingAvg: count === 0 ? null : newAvg,
      ratingCount: count,
      ...(flagged ? { flaggedForDismissal: true } : {}),
    },
  });

  if (options?.notifyOnCross !== false && count > 0) {
    const crossedWarning =
      newAvg < settings.warningThreshold && (prevAvg === null || prevAvg >= settings.warningThreshold);
    const crossedDismissal =
      newAvg < settings.dismissalThreshold &&
      (prevAvg === null || prevAvg >= settings.dismissalThreshold);

    if (crossedWarning) {
      await createNotification(
        db,
        freelancerId,
        "RATING_WARNING",
        `Your average rating dropped to ${newAvg.toFixed(2)}, below ${settings.warningThreshold.toFixed(1)}. If it stays low, your membership could be at risk.`,
      );
    }
    if (crossedDismissal) {
      await createNotification(
        db,
        freelancerId,
        "DISMISSAL_NOTICE",
        `Your average rating fell to ${newAvg.toFixed(2)}, below ${settings.dismissalThreshold.toFixed(1)}. The HiTouch team will review your account.`,
      );
      await notifyAdmins(
        db,
        "DISMISSAL_NOTICE",
        `${freelancerName}'s average rating dropped to ${newAvg.toFixed(2)} — please review their account.`,
      );
    }
  }

  return { newAvg, count, flagged };
}

export async function recomputePartnerRating(db: Db, partnerId: string): Promise<void> {
  const agg = await db.review.aggregate({
    where: {
      freelancerId: partnerId,
      hiddenAt: null,
      reviewerType: { in: [...PARTNER_RATING_REVIEWER_TYPES] },
    },
    _avg: { stars: true },
    _count: { _all: true },
  });
  const count = agg._count._all;
  await db.profile.update({
    where: { userId: partnerId },
    data: {
      ratingAvg: count === 0 ? null : agg._avg.stars,
      ratingCount: count,
    },
  });
}

/**
 * Creates a review inside a transaction, recomputes the subject's cached
 * aggregate, and fires vendor rating automation when applicable.
 */
export async function recordReview(params: RecordReviewParams): Promise<{
  newAvg: number;
  count: number;
  flagged: boolean;
}> {
  return prisma.$transaction(async (tx) => {
    await tx.review.create({
      data: {
        jobId: params.jobId,
        freelancerId: params.subjectUserId,
        reviewerId: params.reviewerId,
        reviewerType: params.reviewerType,
        stars: params.stars,
        feedback: params.feedback,
      },
    });

    if (params.reviewerType === "HIRED_VENDOR") {
      await recomputePartnerRating(tx, params.subjectUserId);
      return { newAvg: 0, count: 0, flagged: false };
    }

    const profile = await tx.profile.findUnique({
      where: { userId: params.subjectUserId },
      select: { ratingAvg: true },
    });

    return recomputeVendorRating(tx, params.subjectUserId, params.subjectName, {
      notifyOnCross: true,
      prevAvg: profile?.ratingAvg ?? null,
    });
  });
}

/** @deprecated Use subjectUserId in new code — kept for scripts/tests. */
export type LegacyRecordReviewParams = Omit<RecordReviewParams, "subjectUserId" | "subjectName"> & {
  freelancerId: string;
  freelancerName: string;
};

export async function recordReviewLegacy(params: LegacyRecordReviewParams) {
  return recordReview({
    jobId: params.jobId,
    subjectUserId: params.freelancerId,
    subjectName: params.freelancerName,
    reviewerId: params.reviewerId,
    reviewerType: params.reviewerType,
    stars: params.stars,
    feedback: params.feedback,
  });
}
