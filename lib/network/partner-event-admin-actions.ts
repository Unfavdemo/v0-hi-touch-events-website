"use server";

import { revalidatePath } from "next/cache";
import {
  normalizeSmsPhone,
  sendAnnouncementEmail,
  sendAnnouncementSms,
} from "@/lib/network/announcement-delivery";
import { logAdminAction } from "@/lib/network/admin-log";
import { canAccessPartnerEvent, requireAdminEventsAccess } from "@/lib/network/event-organizer";
import type { ActionState } from "@/lib/network/auth-actions";
import { createNotification } from "@/lib/network/notifications";
import { prisma } from "@/lib/network/prisma";
import { formatDateTime } from "@/lib/network/utils";
import { firstZodError, partnerEventDetailsSchema } from "@/lib/network/validation";

function parseChannels(formData: FormData) {
  return {
    sendInApp: formData.get("sendInApp") === "on",
    sendEmail: formData.get("sendEmail") === "on",
    sendSms: formData.get("sendSms") === "on",
  };
}

export async function sendPartnerEventDetailsToHired(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const actor = await requireAdminEventsAccess();
  const channels = parseChannels(formData);
  const parsed = partnerEventDetailsSchema.safeParse({
    eventId: formData.get("eventId"),
    message: formData.get("message"),
    ...channels,
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };

  const event = await prisma.partnerEvent.findUnique({
    where: { id: parsed.data.eventId },
    include: {
      partner: { include: { profile: true } },
      opportunities: {
        where: { assignedFreelancerId: { not: null } },
        include: {
          assignedFreelancer: {
            include: { profile: true },
          },
          categoryTag: true,
        },
      },
    },
  });
  if (!event) return { error: "Event not found." };
  if (!(await canAccessPartnerEvent(actor, event))) {
    return { error: "You cannot send details for this event." };
  }

  const hired = new Map<
    string,
    { email: string; phone: string | null; name: string }
  >();
  for (const job of event.opportunities) {
    const v = job.assignedFreelancer;
    if (!v) continue;
    hired.set(v.id, {
      email: v.email,
      phone: v.profile?.phone ?? null,
      name: v.profile?.name ?? v.email,
    });
  }

  if (hired.size === 0) {
    return { error: "No hired vendors on this event yet — hire on each opportunity first." };
  }

  const header = `Event details — ${event.name}`;
  const context = [
    event.location ? `Location: ${event.location}` : null,
    event.applicationCloseAt
      ? `Applications closed: ${formatDateTime(event.applicationCloseAt)}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");
  const fullText = [header, context, "", parsed.data.message.trim()].filter(Boolean).join("\n");

  let inApp = 0;
  let email = 0;
  let sms = 0;

  for (const [userId, contact] of hired) {
    if (parsed.data.sendInApp) {
      await createNotification(prisma, userId, "EVENT_DETAILS", fullText);
      inApp += 1;
    }
    if (parsed.data.sendEmail) {
      const ok = await sendAnnouncementEmail(contact.email, fullText);
      if (ok) email += 1;
    }
    if (parsed.data.sendSms) {
      const to = normalizeSmsPhone(contact.phone);
      if (to) {
        const ok = await sendAnnouncementSms(to, fullText);
        if (ok) sms += 1;
      }
    }
  }

  await logAdminAction(prisma, {
    actorId: actor.id,
    action: "SEND_EVENT_DETAILS",
    targetType: "partner_event",
    targetId: event.id,
    message: `Sent event details for "${event.name}" to ${hired.size} hired vendor(s): in-app ${inApp}, email ${email}, text ${sms}.`,
  });

  revalidatePath(`/network/admin/events/${event.id}`);
  return {
    ok: true,
    detail: `Sent to ${hired.size} hired vendor(s) — in-app ${inApp}, email ${email}, text ${sms}.`,
  };
}
