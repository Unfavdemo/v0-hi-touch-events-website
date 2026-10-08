"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/network/auth";
import type { ActionState } from "@/lib/network/auth-actions";
import { PortraitError, resolvePortrait } from "@/lib/network/portrait";
import { prisma } from "@/lib/network/prisma";
import { firstZodError, partnerProfileUpdateSchema, profileUpdateSchema } from "@/lib/network/validation";
import { VENDOR_AGREEMENT_VERSION } from "@/lib/network/vendor-agreement";
import { requirePartnerOwner } from "@/lib/network/partner-org";

export async function updateFreelancerProfile(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "FREELANCER" || user.status !== "APPROVED") {
    redirect("/network/login");
  }

  const parsed = profileUpdateSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    mailingAddress: formData.get("mailingAddress"),
    bio: formData.get("bio") || undefined,
    companyName: formData.get("companyName") || undefined,
    contactEmail: formData.get("contactEmail") || undefined,
    instagram: formData.get("instagram") || undefined,
    facebook: formData.get("facebook") || undefined,
    tiktok: formData.get("tiktok") || undefined,
    linkedin: formData.get("linkedin") || undefined,
    website: formData.get("website") || undefined,
    categoryTagIds: formData.getAll("categoryTagIds"),
    defaultRate: formData.get("defaultRate") || "",
    travelRadiusMiles: formData.get("travelRadiusMiles") || "",
    crewSize: formData.get("crewSize") || "",
    equipmentNotes: formData.get("equipmentNotes") || undefined,
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };
  const input = parsed.data;

  if (user.profile?.type === "BUSINESS" && !input.companyName) {
    return { error: "Business name is required." };
  }

  let portrait: string | null;
  try {
    portrait = await resolvePortrait(
      formData,
      user.profile?.type === "BUSINESS" ? user.profile.logoUrl : user.profile?.headshotUrl,
    );
  } catch (err) {
    return {
      error: err instanceof PortraitError ? err.message : "Could not save that image.",
    };
  }

  const tagCount = await prisma.categoryTag.count({
    where: { id: { in: input.categoryTagIds } },
  });
  if (tagCount !== input.categoryTagIds.length) {
    return { error: "One or more selected skills are invalid." };
  }

  await prisma.profile.update({
    where: { userId: user.id },
    data: {
      name: input.name,
      phone: input.phone,
      mailingAddress: input.mailingAddress,
      bio: input.bio ?? null,
      companyName:
        user.profile?.type === "BUSINESS" ? (input.companyName ?? null) : user.profile?.companyName,
      headshotUrl: user.profile?.type === "INDIVIDUAL" ? portrait : undefined,
      logoUrl: user.profile?.type === "BUSINESS" ? portrait : undefined,
      socialLinks: {
        instagram: input.instagram,
        facebook: input.facebook,
        tiktok: input.tiktok,
        linkedin: input.linkedin,
        website: input.website,
        email: input.contactEmail,
      },
      categoryTags: { set: input.categoryTagIds.map((id) => ({ id })) },
      defaultRate: input.defaultRate ?? null,
      travelRadiusMiles: input.travelRadiusMiles ?? null,
      crewSize: input.crewSize ?? null,
      equipmentNotes: input.equipmentNotes ?? null,
    },
  });

  revalidatePath("/", "layout");
  revalidatePath(`/network/${user.id}`);
  revalidatePath("/network/freelancer/profile");
  return { ok: true };
}

export async function updatePartnerProfile(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { user } = await requirePartnerOwner();

  const parsed = partnerProfileUpdateSchema.safeParse({
    companyName: formData.get("companyName"),
    contactPerson: formData.get("contactPerson"),
    phone: formData.get("phone"),
    mailingAddress: formData.get("mailingAddress"),
    bio: formData.get("bio") || undefined,
    website: formData.get("website") || undefined,
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };
  const input = parsed.data;

  let portrait: string | null;
  try {
    portrait = await resolvePortrait(formData, user.profile?.logoUrl);
  } catch (err) {
    return {
      error: err instanceof PortraitError ? err.message : "Could not save that image.",
    };
  }

  await prisma.profile.update({
    where: { userId: user.id },
    data: {
      name: input.contactPerson,
      companyName: input.companyName,
      contactPerson: input.contactPerson,
      phone: input.phone,
      mailingAddress: input.mailingAddress,
      bio: input.bio ?? null,
      logoUrl: portrait,
      socialLinks: {
        website: input.website,
      },
    },
  });

  revalidatePath("/", "layout");
  revalidatePath("/network/partner/organization");
  return { ok: true };
}

export async function updateVendorPaperwork(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "FREELANCER" || user.status !== "APPROVED") {
    redirect("/network/login");
  }

  const alreadyAccepted =
    user.profile?.vendorAgreementVersion === VENDOR_AGREEMENT_VERSION &&
    Boolean(user.profile.vendorAgreementAcceptedAt);
  const acceptingNow = formData.get("acceptAgreement") === "1";
  if (!alreadyAccepted && !acceptingNow) {
    return { error: "Please accept the vendor agreement." };
  }

  await prisma.profile.update({
    where: { userId: user.id },
    data: {
      vendorAgreementAcceptedAt: alreadyAccepted
        ? user.profile?.vendorAgreementAcceptedAt
        : new Date(),
      vendorAgreementVersion: VENDOR_AGREEMENT_VERSION,
    },
  });

  revalidatePath("/", "layout");
  revalidatePath("/network/freelancer/profile");
  return { ok: true };
}
