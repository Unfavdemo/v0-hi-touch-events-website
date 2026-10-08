"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ReviewerType } from "@/lib/generated/network-prisma/client";
import { canManageJob } from "@/lib/network/admin-rbac";
import { getCurrentUser } from "@/lib/network/auth";
import { partnerOwnerId } from "@/lib/network/partner-org";
import { prisma } from "@/lib/network/prisma";
import { recordReview } from "@/lib/network/rating-core";
import {
  isVendorReviewSubject,
  VENDOR_RATING_REVIEWER_TYPES,
} from "@/lib/network/review-policy";
import { firstZodError, reviewSchema } from "@/lib/network/validation";
import type { ActionState } from "@/lib/network/auth-actions";

export async function submitReview(
  jobId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || user.status !== "APPROVED") redirect("/network/login");

  const parsed = reviewSchema.safeParse({
    stars: formData.get("stars"),
    feedback: formData.get("feedback"),
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };

  const job = await prisma.jobOpportunity.findUnique({
    where: { id: jobId },
    include: {
      assignedFreelancer: { include: { profile: true } },
      postedBy: { include: { profile: true } },
    },
  });
  if (!job || job.status !== "COMPLETED") {
    return { error: "Reviews open once the opportunity is completed." };
  }

  let reviewerType: ReviewerType;
  let subjectUserId: string;
  let subjectName: string;

  if (user.role === "ADMIN") {
    if (!(await canManageJob(user, job))) {
      return { error: "You can only review opportunities you manage." };
    }
    if (!job.assignedFreelancerId || !job.assignedFreelancer) {
      return { error: "Hire a vendor before leaving a review." };
    }
    if (!isVendorReviewSubject(job.assignedFreelancer)) {
      return { error: "HiTouch staff are not reviewed on the network." };
    }
    reviewerType = "INTERNAL_ADMIN";
    subjectUserId = job.assignedFreelancerId;
    subjectName = job.assignedFreelancer.profile?.name ?? "This vendor";
  } else if (user.role === "PARTNER") {
    if (!(await canManageJob(user, job))) {
      return { error: "You can only review your organization’s opportunities." };
    }
    if (!job.assignedFreelancerId || !job.assignedFreelancer) {
      return { error: "Hire a vendor before leaving a review." };
    }
    if (!isVendorReviewSubject(job.assignedFreelancer)) {
      return { error: "HiTouch staff are not reviewed on the network." };
    }
    const ownerId = await partnerOwnerId(user.id);
    const existingClient = await prisma.review.findFirst({
      where: { jobId, reviewerType: "CLIENT_PARTNER", job: { postedById: ownerId } },
    });
    if (existingClient) {
      return { error: "Your organization already reviewed this opportunity." };
    }
    reviewerType = "CLIENT_PARTNER";
    subjectUserId = job.assignedFreelancerId;
    subjectName = job.assignedFreelancer.profile?.name ?? "This vendor";
  } else if (user.role === "FREELANCER") {
    if (job.assignedFreelancerId !== user.id) {
      return { error: "You can only review opportunities you worked." };
    }
    if (job.postedBy.role !== "PARTNER") {
      return { error: "You can review the partner organization that hired you." };
    }
    reviewerType = "HIRED_VENDOR";
    subjectUserId = job.postedById;
    subjectName =
      job.postedBy.profile?.companyName ?? job.postedBy.profile?.name ?? "The partner";
  } else {
    return { error: "You cannot leave a review on this opportunity." };
  }

  try {
    await recordReview({
      jobId,
      subjectUserId,
      subjectName,
      reviewerId: user.id,
      reviewerType,
      stars: parsed.data.stars,
      feedback: parsed.data.feedback,
    });
  } catch {
    return { error: "You've already reviewed this opportunity." };
  }

  revalidatePath("/", "layout");
  revalidatePath("/network/partner/reviews");
  revalidatePath("/network/freelancer/reviews");
  revalidatePath(`/network/partner/jobs/${jobId}`);
  revalidatePath(`/network/freelancer/jobs/${jobId}`);
  revalidatePath(`/network/admin/jobs/${jobId}`);
  return {};
}

export interface RatingSummary {
  overall: { avg: number | null; count: number };
  byType: Record<ReviewerType, { avg: number | null; count: number }>;
}

export async function getRatingSummary(freelancerId: string): Promise<RatingSummary> {
  const vendorReviewFilter = {
    freelancerId: freelancerId,
    hiddenAt: null,
    reviewerType: { in: [...VENDOR_RATING_REVIEWER_TYPES] },
  };
  const [overall, byType] = await Promise.all([
    prisma.review.aggregate({
      where: vendorReviewFilter,
      _avg: { stars: true },
      _count: { _all: true },
    }),
    prisma.review.groupBy({
      by: ["reviewerType"],
      where: vendorReviewFilter,
      _avg: { stars: true },
      _count: { _all: true },
    }),
  ]);

  const summary: RatingSummary = {
    overall: { avg: overall._avg.stars, count: overall._count._all },
    byType: {
      INTERNAL_ADMIN: { avg: null, count: 0 },
      CLIENT_PARTNER: { avg: null, count: 0 },
      HIRED_VENDOR: { avg: null, count: 0 },
    },
  };
  for (const row of byType) {
    summary.byType[row.reviewerType] = {
      avg: row._avg.stars,
      count: row._count._all,
    };
  }
  return summary;
}
