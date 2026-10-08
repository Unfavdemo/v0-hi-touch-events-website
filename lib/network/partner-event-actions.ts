"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/network/auth-actions";
import {
  assertOrganizerJobAccess,
  canManagePartnerEvent,
  eventAndJobSameOwner,
  requireEventOrganizer,
  type EventOrganizerContext,
} from "@/lib/network/event-organizer";
import { afterJobActivatedForEvent, trySendInitialEventOutreach } from "@/lib/network/partner-event-outreach";
import { prisma } from "@/lib/network/prisma";
import { firstZodError, partnerEventSchema } from "@/lib/network/validation";

function revalidateEvents(ctx: EventOrganizerContext, eventId?: string) {
  revalidatePath(ctx.eventsBasePath);
  revalidatePath(ctx.jobsBasePath, "layout");
  revalidatePath("/network/partner/events");
  revalidatePath("/network/admin/events");
  revalidatePath("/network/partner", "layout");
  revalidatePath("/network/admin", "layout");
  if (eventId) {
    revalidatePath(`${ctx.eventsBasePath}/${eventId}`);
    revalidatePath(`/network/partner/events/${eventId}`);
    revalidatePath(`/network/admin/events/${eventId}`);
  }
}

export async function createPartnerEvent(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ctx = await requireEventOrganizer();
  const parsed = partnerEventSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    location: formData.get("location") || undefined,
    applicationCloseAt: formData.get("applicationCloseAt") || undefined,
    outreachAudience: formData.get("outreachAudience") || "INVITED_ONLY",
    sendInitialOutreach: formData.get("sendInitialOutreach") === "on",
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };

  const event = await prisma.partnerEvent.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      location: parsed.data.location || null,
      applicationCloseAt: parsed.data.applicationCloseAt ?? null,
      outreachAudience: parsed.data.outreachAudience ?? "INVITED_ONLY",
      partnerId: ctx.organizerId,
    },
  });

  if (parsed.data.sendInitialOutreach) {
    await trySendInitialEventOutreach(event.id);
  }

  revalidateEvents(ctx, event.id);
  redirect(`${ctx.eventsBasePath}/${event.id}`);
}

export async function updatePartnerEvent(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ctx = await requireEventOrganizer();
  const eventId = String(formData.get("eventId") ?? "");
  if (!eventId) return { error: "Missing event." };

  const parsed = partnerEventSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    location: formData.get("location") || undefined,
    applicationCloseAt: formData.get("applicationCloseAt") || undefined,
    outreachAudience: formData.get("outreachAudience") || undefined,
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };
  if (!(await canManagePartnerEvent(ctx.user, eventId))) {
    return { error: "Event not found." };
  }

  await prisma.partnerEvent.update({
    where: { id: eventId },
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      location: parsed.data.location || null,
      applicationCloseAt: parsed.data.applicationCloseAt ?? null,
      ...(parsed.data.outreachAudience
        ? { outreachAudience: parsed.data.outreachAudience }
        : {}),
    },
  });

  revalidateEvents(ctx, eventId);
  return { ok: true, detail: "Event updated." };
}

export async function linkJobToPartnerEvent(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ctx = await requireEventOrganizer();
  const eventId = String(formData.get("eventId") ?? "");
  const jobId = String(formData.get("jobId") ?? "");
  if (!eventId || !jobId) return { error: "Pick an opportunity to link." };

  if (!(await canManagePartnerEvent(ctx.user, eventId))) {
    return { error: "Event not found." };
  }
  if (!(await assertOrganizerJobAccess(ctx, jobId))) {
    return { error: "Opportunity not found." };
  }
  if (!(await eventAndJobSameOwner(eventId, jobId))) {
    return {
      error: "This opportunity must be posted by the same organization that owns the event.",
    };
  }

  await prisma.jobOpportunity.update({
    where: { id: jobId },
    data: { partnerEventId: eventId },
  });

  const job = await prisma.jobOpportunity.findUnique({
    where: { id: jobId },
    select: { status: true },
  });
  if (job?.status === "ACTIVE") {
    await afterJobActivatedForEvent(jobId);
  }

  revalidateEvents(ctx, eventId);
  revalidatePath(`${ctx.jobsBasePath}/${jobId}`);
  revalidatePath(`/network/admin/jobs/${jobId}`);
  revalidatePath(`/network/partner/jobs/${jobId}`);
  return { ok: true, detail: "Opportunity linked to this event." };
}

export async function setJobPartnerEventFromJobPage(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ctx = await requireEventOrganizer();
  const jobId = String(formData.get("jobId") ?? "");
  const rawEventId = String(formData.get("partnerEventId") ?? "").trim();
  const partnerEventId = rawEventId.length > 0 ? rawEventId : null;

  if (!jobId) return { error: "Missing opportunity." };
  if (!(await assertOrganizerJobAccess(ctx, jobId))) {
    return { error: "Opportunity not found." };
  }

  if (partnerEventId) {
    if (!(await canManagePartnerEvent(ctx.user, partnerEventId))) {
      return { error: "Event not found." };
    }
    if (!(await eventAndJobSameOwner(partnerEventId, jobId))) {
      return {
        error: "Pick an event owned by the same organization as this opportunity.",
      };
    }
  }

  await prisma.jobOpportunity.update({
    where: { id: jobId },
    data: { partnerEventId },
  });

  revalidateEvents(ctx, partnerEventId ?? undefined);
  revalidatePath(`${ctx.jobsBasePath}/${jobId}`);
  revalidatePath(`/network/admin/jobs/${jobId}`);
  revalidatePath(`/network/partner/jobs/${jobId}`);
  return {
    ok: true,
    detail: partnerEventId ? "Linked to event." : "Removed from event.",
  };
}

export async function partnerEventsForOwner(ownerId: string) {
  return prisma.partnerEvent.findMany({
    where: { partnerId: ownerId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      location: true,
      _count: { select: { opportunities: true } },
    },
  });
}

export async function validatePartnerEventForJob(
  partnerEventId: string | undefined,
  postedById: string,
): Promise<string | undefined> {
  if (!partnerEventId) return undefined;
  const event = await prisma.partnerEvent.findFirst({
    where: { id: partnerEventId, partnerId: postedById },
    select: { id: true },
  });
  if (!event) return undefined;
  return partnerEventId;
}
