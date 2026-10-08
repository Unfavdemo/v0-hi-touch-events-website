"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser, hasActiveMembership, roleHome } from "@/lib/network/auth";
import { scoreVendorsForJob, topUpInvites } from "@/lib/network/matching";
import { canManageJob, isEventAdmin, isSuperAdmin } from "@/lib/network/admin-rbac";
import { getPlatformSettings } from "@/lib/network/platform-settings";
import { createNotification, notifyAdmins, notifyJobStaff, notifyPartnerOrg } from "@/lib/network/notifications";
import { partnerOwnerId } from "@/lib/network/partner-org";
import { canManagePartnerEvent } from "@/lib/network/event-organizer";
import { validatePartnerEventForJob } from "@/lib/network/partner-event-actions";
import {
  evaluateApplicationRequirements,
  parseCustomRequirementLines,
  persistJobDocumentRequirements,
} from "@/lib/network/document-requirements";
import { afterJobActivatedForEvent, isEventApplicationOpen } from "@/lib/network/partner-event-outreach";
import { PAPERWORK_APPLY_MESSAGE } from "@/lib/network/paperwork";
import { prisma } from "@/lib/network/prisma";
import { bidSchema, firstZodError, jobSchema } from "@/lib/network/validation";
import type { ActionState } from "@/lib/network/auth-actions";

function revalidateAll() {
  revalidatePath("/", "layout");
}

export async function createJob(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || user.status !== "APPROVED") redirect("/network/login");

  const parsed = jobSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    categoryTagId: formData.get("categoryTagId"),
    payRate: formData.get("payRate"),
    location: formData.get("location"),
    setupTime: formData.get("setupTime"),
    eventStartTime: formData.get("eventStartTime"),
    eventEndTime: formData.get("eventEndTime"),
    breakdownTime: formData.get("breakdownTime"),
    isOpenBidding: formData.get("isOpenBidding") === "on",
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };
  const input = parsed.data;

  const superAdmin = isSuperAdmin(user);
  const eventAdmin = isEventAdmin(user);
  const adminPoster = user.role === "ADMIN" && (superAdmin || eventAdmin);
  if (user.role === "ADMIN" && !adminPoster) {
    return { error: "You do not have permission to post opportunities." };
  }
  let postedById = user.role === "PARTNER" ? await partnerOwnerId(user.id) : user.id;
  const goLiveImmediately = superAdmin || eventAdmin;
  const rawPartnerEventId = String(formData.get("partnerEventId") ?? "").trim();
  if (user.role === "ADMIN" && rawPartnerEventId && superAdmin) {
    const event = await prisma.partnerEvent.findUnique({
      where: { id: rawPartnerEventId },
      select: { partnerId: true },
    });
    if (event && (await canManagePartnerEvent(user, rawPartnerEventId))) {
      postedById = event.partnerId;
    }
  }
  const partnerEventId = await validatePartnerEventForJob(
    rawPartnerEventId.length > 0 ? rawPartnerEventId : undefined,
    postedById,
  );
  const returnToEvent = formData.get("returnToEvent") === "1" && partnerEventId;
  const partnerRequirementIds = formData
    .getAll("partnerRequirementId")
    .map((v) => String(v))
    .filter(Boolean);
  const customRequirements = parseCustomRequirementLines(
    String(formData.get("customRequirementLabels") ?? ""),
  );

  const job = await prisma.jobOpportunity.create({
    data: {
      title: input.title,
      description: input.description,
      categoryTagId: input.categoryTagId,
      payRate: input.payRate,
      location: input.location,
      setupTime: input.setupTime,
      eventStartTime: input.eventStartTime,
      eventEndTime: input.eventEndTime,
      breakdownTime: input.breakdownTime,
      isOpenBidding: input.isOpenBidding,
      status: goLiveImmediately ? "ACTIVE" : "PENDING_APPROVAL",
      postedById,
      partnerEventId: partnerEventId ?? null,
    },
  });

  if (user.role === "PARTNER") {
    const validIds =
      partnerRequirementIds.length > 0
        ? (
            await prisma.partnerDocumentRequirement.findMany({
              where: { partnerId: postedById, id: { in: partnerRequirementIds } },
              select: { id: true },
            })
          ).map((r) => r.id)
        : [];
    await persistJobDocumentRequirements(job.id, validIds, customRequirements);
  } else if (adminPoster) {
    await persistJobDocumentRequirements(job.id, [], customRequirements);
  }

  if (eventAdmin) {
    await prisma.eventDelegation.upsert({
      where: { jobId_adminId: { jobId: job.id, adminId: user.id } },
      update: {},
      create: { jobId: job.id, adminId: user.id, delegatedById: user.id },
    });
  }

  if (goLiveImmediately) {
    await topUpInvites(job.id);
    await afterJobActivatedForEvent(job.id);
  } else {
    await notifyAdmins(
      prisma,
      "JOB_ALERT",
      `New opportunity waiting for your approval: "${job.title}".`,
    );
  }

  revalidateAll();
  if (returnToEvent) {
    redirect(
      user.role === "ADMIN" ? `/admin/events/${partnerEventId}` : `/partner/events/${partnerEventId}`,
    );
  }
  redirect(user.role === "ADMIN" ? "/admin/jobs" : roleHome(user));
}

export async function updateJob(
  jobId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || user.status !== "APPROVED") redirect("/network/login");

  const existing = await prisma.jobOpportunity.findUnique({ where: { id: jobId } });
  if (!existing) return { error: "Opportunity not found." };
  if (!(await canManageJob(user, existing))) {
    return { error: "You cannot edit this opportunity." };
  }
  if (existing.status === "COMPLETED" || existing.status === "FILLED") {
    return { error: "This opportunity can no longer be edited." };
  }

  const parsed = jobSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    categoryTagId: formData.get("categoryTagId"),
    payRate: formData.get("payRate"),
    location: formData.get("location"),
    setupTime: formData.get("setupTime"),
    eventStartTime: formData.get("eventStartTime"),
    eventEndTime: formData.get("eventEndTime"),
    breakdownTime: formData.get("breakdownTime"),
    isOpenBidding: formData.get("isOpenBidding") === "on",
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };
  const input = parsed.data;

  await prisma.jobOpportunity.update({
    where: { id: jobId },
    data: {
      title: input.title,
      description: input.description,
      categoryTagId: input.categoryTagId,
      payRate: input.payRate,
      location: input.location,
      setupTime: input.setupTime,
      eventStartTime: input.eventStartTime,
      eventEndTime: input.eventEndTime,
      breakdownTime: input.breakdownTime,
      isOpenBidding: input.isOpenBidding,
    },
  });

  revalidateAll();
  revalidatePath(`/network/admin/jobs/${jobId}`);
  revalidatePath(`/network/partner/jobs/${jobId}`);
  if (existing.partnerEventId) {
    revalidatePath(`/network/admin/events/${existing.partnerEventId}`);
    revalidatePath(`/network/partner/events/${existing.partnerEventId}`);
  }
  redirect(user.role === "ADMIN" ? `/admin/jobs/${jobId}` : `/partner/jobs/${jobId}`);
}

export async function approveJob(jobId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.status !== "APPROVED") redirect("/network/login");

  const existing = await prisma.jobOpportunity.findUnique({ where: { id: jobId } });
  if (!existing || existing.status !== "PENDING_APPROVAL") return;
  if (!(await canManageJob(user, existing))) return;

  const job = await prisma.jobOpportunity.update({
    where: { id: jobId, status: "PENDING_APPROVAL" },
    data: { status: "ACTIVE" },
  });

  await notifyPartnerOrg(
    prisma,
    job.postedById,
    "EVENT_APPROVED",
    `Your opportunity "${job.title}" was approved. We've invited the best-matched available vendors to apply.`,
  );
  await topUpInvites(job.id);
  await afterJobActivatedForEvent(job.id);

  revalidateAll();
}

export async function submitBid(
  jobId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "FREELANCER" || user.status !== "APPROVED") {
    redirect("/network/login");
  }
  if (!hasActiveMembership(user)) {
    return { error: "You need an active membership to apply to opportunities." };
  }
  const { ready, requirements } = await evaluateApplicationRequirements({
    vendorId: user.id,
    profile: user.profile,
    jobId,
  });
  if (!ready) {
    const missing = requirements
      .filter((r) => !r.met)
      .map((r) => r.label)
      .join(", ");
    return {
      error: missing
        ? `Add required documents before applying: ${missing}.`
        : PAPERWORK_APPLY_MESSAGE,
    };
  }

  const parsed = bidSchema.safeParse({
    amount: formData.get("amount"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };

  const job = await prisma.jobOpportunity.findUnique({ where: { id: jobId } });
  if (!job || job.status !== "ACTIVE") {
    return { error: "This opportunity is not accepting applications." };
  }
  if (!(await isEventApplicationOpen(jobId))) {
    return { error: "Applications for this event have closed." };
  }
  const invite = await prisma.jobInvite.findUnique({
    where: { jobId_freelancerId: { jobId, freelancerId: user.id } },
  });
  const hasInvite = invite?.status === "PENDING";
  if (!job.isOpenBidding && !hasInvite) {
    return { error: "This opportunity is invite-only — watch your Invites page for new opportunities." };
  }
  const tagIds = user.profile?.categoryTags.map((t) => t.id) ?? [];
  if (!hasInvite && !tagIds.includes(job.categoryTagId)) {
    return { error: "This opportunity isn't in one of your skill categories." };
  }

  try {
    await prisma.bidProposal.create({
      data: {
        jobId,
        freelancerId: user.id,
        amount: parsed.data.amount,
        notes: parsed.data.notes,
      },
    });
  } catch {
    return { error: "You already applied to this opportunity." };
  }
  if (invite) {
    await prisma.jobInvite.update({
      where: { id: invite.id },
      data: { status: "APPLIED", respondedAt: new Date() },
    });
  }

  await notifyPartnerOrg(
    prisma,
    job.postedById,
    "NEW_APPLICANT",
    `New application on "${job.title}" from ${user.profile?.name ?? user.email}.`,
  );
  await notifyJobStaff(
    prisma,
    job.id,
    "JOB_ALERT",
    `New application on "${job.title}" from ${user.profile?.name ?? user.email}.`,
  );

  revalidateAll();
  redirect("/network/freelancer/bids");
}

export async function acceptBid(bidId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.status !== "APPROVED") redirect("/network/login");

  const bid = await prisma.bidProposal.findUnique({
    where: { id: bidId },
    include: { job: true, freelancer: { include: { profile: true } } },
  });
  if (!bid || bid.status !== "SUBMITTED") return;

  const canManage = await canManageJob(user, bid.job);
  if (!canManage || bid.job.status !== "ACTIVE") return;
  const { ready } = await evaluateApplicationRequirements({
    vendorId: bid.freelancerId,
    profile: bid.freelancer.profile,
    jobId: bid.job.id,
  });
  if (!ready) return;
  const [match] = await scoreVendorsForJob(bid.job, [bid.freelancerId]);
  if (!match?.available) return;

  const declined = await prisma.$transaction(async (tx) => {
    await tx.bidProposal.update({
      where: { id: bidId },
      data: { status: "ACCEPTED" },
    });
    const others = await tx.bidProposal.findMany({
      where: { jobId: bid.jobId, id: { not: bidId }, status: "SUBMITTED" },
      select: { freelancerId: true },
    });
    await tx.bidProposal.updateMany({
      where: { jobId: bid.jobId, id: { not: bidId }, status: "SUBMITTED" },
      data: { status: "DECLINED" },
    });
    await tx.jobOpportunity.update({
      where: { id: bid.jobId },
      data: { status: "FILLED", assignedFreelancerId: bid.freelancerId },
    });
    await tx.jobInvite.updateMany({
      where: { jobId: bid.jobId, status: "PENDING" },
      data: { status: "WITHDRAWN" },
    });
    return others;
  });

  await createNotification(
    prisma,
    bid.freelancerId,
    "JOB_ALERT",
    `You were selected — you're booked for "${bid.job.title}".`,
  );
  if (declined.length > 0) {
    await prisma.notification.createMany({
      data: declined.map((d) => ({
        userId: d.freelancerId,
        type: "JOB_ALERT" as const,
        message: `The role for "${bid.job.title}" was filled by another vendor.`,
      })),
    });
  }

  revalidateAll();
}

export async function markJobCompleted(jobId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.status !== "APPROVED") redirect("/network/login");

  const job = await prisma.jobOpportunity.findUnique({ where: { id: jobId } });
  if (!job || job.status !== "FILLED") return;

  const canManage = await canManageJob(user, job);
  if (!canManage) return;

  await prisma.jobOpportunity.update({
    where: { id: jobId },
    data: { status: "COMPLETED" },
  });

  if (job.assignedFreelancerId) {
    await createNotification(
      prisma,
      job.assignedFreelancerId,
      "JOB_ALERT",
      `"${job.title}" is marked completed. Reviews are now open.`,
    );
  }
  await notifyPartnerOrg(
    prisma,
    job.postedById,
    "REVIEW_NEEDED",
    `"${job.title}" is complete. Leave a review for your vendor — it shapes who we recommend next time.`,
  );
  await notifyJobStaff(
    prisma,
    job.id,
    "JOB_ALERT",
    `"${job.title}" is complete. Leave your HiTouch review for the vendor.`,
  );

  revalidateAll();
}

export async function declineInvite(inviteId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.role !== "FREELANCER") redirect("/network/login");

  const invite = await prisma.jobInvite.findUnique({
    where: { id: inviteId },
    include: { job: true },
  });
  if (!invite || invite.freelancerId !== user.id || invite.status !== "PENDING") return;

  await prisma.jobInvite.update({
    where: { id: inviteId },
    data: { status: "DECLINED", respondedAt: new Date() },
  });
  await notifyPartnerOrg(
    prisma,
    invite.job.postedById,
    "VENDOR_WITHDREW",
    `${user.profile?.name ?? user.email} declined the invite for "${invite.job.title}". We'll invite the next available match.`,
  );
  await topUpInvites(invite.jobId);

  revalidateAll();
}

async function requireJobManager(jobId: string) {
  const user = await getCurrentUser();
  if (!user || user.status !== "APPROVED") redirect("/network/login");
  const job = await prisma.jobOpportunity.findUnique({ where: { id: jobId } });
  if (!job) return null;
  const canManage = await canManageJob(user, job);
  return canManage ? job : null;
}

/** Partner hand-picks a vendor. They must be eligible and free for the opportunity window. */
export async function inviteVendor(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const jobId = String(formData.get("jobId") ?? "");
  const freelancerId = String(formData.get("freelancerId") ?? "");
  const job = await requireJobManager(jobId);
  if (!job) return { error: "Pick one of your opportunities." };
  if (job.status !== "ACTIVE") {
    return { error: "Invites open once HiTouch Solutions verifies the opportunity." };
  }

  const blocked = await prisma.partnerVendor.findUnique({
    where: {
      partnerId_vendorId: { partnerId: job.postedById, vendorId: freelancerId },
    },
    select: { blocked: true },
  });
  if (blocked?.blocked) {
    return { error: "This vendor is on your blocked list." };
  }

  const match = (await scoreVendorsForJob(job)).find((m) => m.freelancerId === freelancerId);
  if (!match) {
    return { error: "This vendor doesn't staff that opportunity's category." };
  }
  if (!match.available) {
    return { error: "This vendor is already booked during that opportunity." };
  }

  const existing = await prisma.jobInvite.findUnique({
    where: { jobId_freelancerId: { jobId, freelancerId } },
  });
  if (existing) return { error: "This vendor was already invited to that opportunity." };

  await prisma.jobInvite.create({
    data: {
      jobId,
      freelancerId,
      source: "PARTNER",
      matchScore: match.score,
      matchReasons: match.reasons,
    },
  });
  await createNotification(
    prisma,
    freelancerId,
    "JOB_ALERT",
    `A partner personally invited you to apply for "${job.title}".`,
  );

  revalidateAll();
  return { ok: true };
}

export async function sendMoreInvites(jobId: string): Promise<void> {
  const job = await requireJobManager(jobId);
  if (!job || job.status !== "ACTIVE") return;
  const settings = await getPlatformSettings();
  await topUpInvites(jobId, settings.sendMoreExtra);
  revalidateAll();
}
