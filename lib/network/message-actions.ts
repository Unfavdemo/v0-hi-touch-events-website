"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canManageJob } from "@/lib/network/admin-rbac";
import { getCurrentUser } from "@/lib/network/auth";
import type { ActionState } from "@/lib/network/auth-actions";
import { createNotification, notifyPartnerOrg } from "@/lib/network/notifications";
import { prisma } from "@/lib/network/prisma";
import { firstZodError, jobMessageSchema } from "@/lib/network/validation";

function revalidateMessages(jobId: string) {
  revalidatePath("/", "layout");
  revalidatePath("/network/partner/messages");
  revalidatePath("/network/freelancer/messages");
  revalidatePath(`/network/partner/jobs/${jobId}`);
  revalidatePath(`/network/freelancer/jobs/${jobId}`);
  revalidatePath(`/network/admin/jobs/${jobId}`);
}

export async function canAccessJobThread(
  user: { id: string; role: string; adminScope?: string | null; status?: string },
  job: { id: string; postedById: string; assignedFreelancerId: string | null },
): Promise<boolean> {
  if (job.assignedFreelancerId === user.id) return true;
  return canManageJob(user, job);
}

export async function postJobMessage(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || user.status !== "APPROVED") redirect("/network/login");

  const parsed = jobMessageSchema.safeParse({
    jobId: formData.get("jobId"),
    body: formData.get("body"),
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };

  const job = await prisma.jobOpportunity.findUnique({
    where: { id: parsed.data.jobId },
    select: {
      id: true,
      title: true,
      postedById: true,
      assignedFreelancerId: true,
      status: true,
    },
  });
  if (!job || !job.assignedFreelancerId) {
    return { error: "Messages open after you hire a vendor." };
  }
  if (!(await canAccessJobThread(user, job))) {
    return { error: "You can only message on opportunities you're part of." };
  }

  await prisma.jobMessage.create({
    data: {
      jobId: job.id,
      senderId: user.id,
      body: parsed.data.body,
    },
  });

  const who = user.profile?.name ?? user.email;
  const preview =
    parsed.data.body.length > 80 ? `${parsed.data.body.slice(0, 77)}…` : parsed.data.body;
  const text = `${who} on "${job.title}": ${preview}`;

  if (job.assignedFreelancerId !== user.id) {
    await createNotification(prisma, job.assignedFreelancerId, "MESSAGE", text);
  }
  await notifyPartnerOrg(prisma, job.postedById, "MESSAGE", text, user.id);

  revalidateMessages(job.id);
  return { ok: true };
}
