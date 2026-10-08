"use server";

import { revalidatePath } from "next/cache";
import type { MembershipStatus } from "@/lib/generated/network-prisma/client";
import {
  normalizeSmsPhone,
  recipientAllowsAnnouncements,
  sendAnnouncementEmail,
  sendAnnouncementSms,
  type AnnouncementRecipient,
} from "@/lib/network/announcement-delivery";
import { logAdminAction } from "@/lib/network/admin-log";
import { requireSuperAdmin } from "@/lib/network/admin-rbac";
import type { ActionState } from "@/lib/network/auth-actions";
import { prisma } from "@/lib/network/prisma";
import { announcementSchema, firstZodError } from "@/lib/network/validation";

function revalidateAll() {
  revalidatePath("/", "layout");
}

function parseChannels(formData: FormData) {
  return {
    sendInApp: formData.get("sendInApp") === "on",
    sendEmail: formData.get("sendEmail") === "on",
    sendSms: formData.get("sendSms") === "on",
  };
}

export async function sendAnnouncement(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const actor = await requireSuperAdmin();
  const channels = parseChannels(formData);
  const parsed = announcementSchema.safeParse({
    audience: formData.get("audience"),
    skillTagId: formData.get("skillTagId") || undefined,
    membershipStatus: formData.get("membershipStatus") || undefined,
    jobId: formData.get("jobId") || undefined,
    opportunityScope: formData.get("opportunityScope") || undefined,
    message: formData.get("message"),
    ...channels,
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };

  const recipients = await announcementRecipientContacts({
    audience: parsed.data.audience,
    skillTagId: parsed.data.skillTagId,
    membershipStatus: parsed.data.membershipStatus,
    jobId: parsed.data.jobId,
    opportunityScope: parsed.data.opportunityScope,
  });
  if (recipients.length === 0) return { error: "Nobody matches that audience." };

  let inAppCount = 0;
  let emailCount = 0;
  let smsCount = 0;
  let emailFailed = 0;
  let smsFailed = 0;
  let smsSkippedNoPhone = 0;

  if (parsed.data.sendInApp) {
    const inAppTargets = recipients.filter((r) => r.allowAnnouncements);
    if (inAppTargets.length > 0) {
      await prisma.notification.createMany({
        data: inAppTargets.map((r) => ({
          userId: r.id,
          type: "ANNOUNCEMENT" as const,
          message: parsed.data.message,
        })),
      });
      inAppCount = inAppTargets.length;
    }
  }

  if (parsed.data.sendEmail) {
    for (const r of recipients.filter((x) => x.allowAnnouncements)) {
      const ok = await sendAnnouncementEmail(r.email, parsed.data.message);
      if (ok) emailCount += 1;
      else emailFailed += 1;
    }
  }

  if (parsed.data.sendSms) {
    for (const r of recipients.filter((x) => x.allowAnnouncements)) {
      const to = normalizeSmsPhone(r.phone);
      if (!to) {
        smsSkippedNoPhone += 1;
        continue;
      }
      const ok = await sendAnnouncementSms(to, parsed.data.message);
      if (ok) smsCount += 1;
      else smsFailed += 1;
    }
  }

  const channelParts: string[] = [];
  if (parsed.data.sendInApp) channelParts.push(`in-app ${inAppCount}`);
  if (parsed.data.sendEmail) channelParts.push(`email ${emailCount}`);
  if (parsed.data.sendSms) {
    channelParts.push(`text ${smsCount}`);
    if (smsSkippedNoPhone) channelParts.push(`${smsSkippedNoPhone} without phone`);
  }

  const audienceDesc = await describeAudience(parsed.data);

  await logAdminAction(prisma, {
    actorId: actor.id,
    action: "SEND_ANNOUNCEMENT",
    targetType: "announcement",
    targetId: parsed.data.audience === "opportunity" && parsed.data.jobId ? parsed.data.jobId : actor.id,
    message: `Sent announcement to ${recipients.length} people (${audienceDesc}): ${channelParts.join(", ")}`,
  });

  revalidateAll();

  const warnings: string[] = [];
  if (emailFailed) warnings.push(`${emailFailed} email(s) failed`);
  if (smsFailed) warnings.push(`${smsFailed} text(s) failed`);

  return {
    ok: true,
    detail: `Delivered — ${channelParts.join(" · ")}.${warnings.length ? ` ${warnings.join("; ")}.` : ""}`,
  };
}

export async function announcementRecipients(input: {
  audience: string;
  skillTagId?: string;
  membershipStatus?: string;
  jobId?: string;
  opportunityScope?: string;
}): Promise<string[]> {
  const rows = await announcementRecipientContacts(input);
  return rows.map((r) => r.id);
}

async function announcementRecipientContacts(input: {
  audience: string;
  skillTagId?: string;
  membershipStatus?: string;
  jobId?: string;
  opportunityScope?: string;
}): Promise<AnnouncementRecipient[]> {
  if (input.audience === "opportunity" && input.jobId && input.opportunityScope) {
    const userIds = await opportunityRecipientUserIds(input.jobId, input.opportunityScope);
    if (userIds.length === 0) return [];
    const rows = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        email: true,
        role: true,
        profile: { select: { phone: true, notificationPrefs: true } },
      },
    });
    return rows.map((r) => ({
      id: r.id,
      email: r.email,
      phone: r.profile?.phone ?? null,
      allowAnnouncements: recipientAllowsAnnouncements(r.role, r.profile?.notificationPrefs),
    }));
  }

  const where = audienceWhere(input);
  if (!where) return [];

  const rows = await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      role: true,
      profile: { select: { phone: true, notificationPrefs: true } },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    phone: r.profile?.phone ?? null,
    allowAnnouncements: recipientAllowsAnnouncements(r.role, r.profile?.notificationPrefs),
  }));
}

function audienceWhere(input: {
  audience: string;
  skillTagId?: string;
  membershipStatus?: string;
}) {
  if (input.audience === "vendors") {
    return { role: "FREELANCER" as const, status: "APPROVED" as const };
  }
  if (input.audience === "partners") {
    return { role: "PARTNER" as const, status: "APPROVED" as const };
  }
  if (input.audience === "skill" && input.skillTagId) {
    return {
      role: "FREELANCER" as const,
      status: "APPROVED" as const,
      profile: { categoryTags: { some: { id: input.skillTagId } } },
    };
  }
  if (input.audience === "membership" && input.membershipStatus) {
    return {
      role: "FREELANCER" as const,
      membership: { status: input.membershipStatus as MembershipStatus },
    };
  }
  return null;
}

async function opportunityRecipientUserIds(
  jobId: string,
  scope: string,
): Promise<string[]> {
  const job = await prisma.jobOpportunity.findUnique({
    where: { id: jobId },
    select: {
      postedById: true,
      assignedFreelancerId: true,
      bids: { select: { freelancerId: true } },
      invites: { select: { freelancerId: true } },
    },
  });
  if (!job) return [];

  const hired = job.assignedFreelancerId ? [job.assignedFreelancerId] : [];
  const invited = job.invites.map((i) => i.freelancerId);
  const applicants = job.bids.map((b) => b.freelancerId);
  const allVendors = uniqueIds([...hired, ...invited, ...applicants]);

  switch (scope) {
    case "hired":
      return hired;
    case "invited":
      return uniqueIds(invited);
    case "applicants":
      return uniqueIds(applicants);
    case "all_vendors":
      return allVendors;
    case "partner":
      return [job.postedById];
    case "everyone":
      return uniqueIds([...allVendors, job.postedById]);
    default:
      return [];
  }
}

function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids)];
}

const OPPORTUNITY_SCOPE_LABELS: Record<string, string> = {
  hired: "hired vendor",
  invited: "invited vendors",
  applicants: "applicants",
  all_vendors: "all vendors on opportunity",
  partner: "posting partner",
  everyone: "everyone on opportunity",
};

async function describeAudience(input: {
  audience: string;
  skillTagId?: string;
  membershipStatus?: string;
  jobId?: string;
  opportunityScope?: string;
}): Promise<string> {
  if (input.audience === "opportunity" && input.jobId) {
    const job = await prisma.jobOpportunity.findUnique({
      where: { id: input.jobId },
      select: { title: true },
    });
    const scope =
      OPPORTUNITY_SCOPE_LABELS[input.opportunityScope ?? ""] ?? input.opportunityScope ?? "";
    return `opportunity “${job?.title ?? input.jobId}” — ${scope}`;
  }
  return audienceLabel(input);
}

function audienceLabel(input: {
  audience: string;
  skillTagId?: string;
  membershipStatus?: string;
}): string {
  if (input.audience === "vendors") return "all vendors";
  if (input.audience === "partners") return "all partners";
  if (input.audience === "skill") return `skill ${input.skillTagId ?? ""}`;
  if (input.audience === "membership") return `membership ${input.membershipStatus ?? ""}`;
  if (input.audience === "opportunity") return "opportunity";
  return input.audience;
}
