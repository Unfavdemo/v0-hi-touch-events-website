"use server";

import { redirect } from "next/navigation";
import {
  clearSessionCookie,
  hashPassword,
  roleHome,
  setSessionCookie,
  verifyPassword,
} from "@/lib/network/auth";
import { notifyAdmins } from "@/lib/network/notifications";
import { prisma } from "@/lib/network/prisma";
import { createMembershipCheckout } from "@/lib/network/stripe";
import { PortraitError, saveUploadedPortrait } from "@/lib/network/portrait";
import { VENDOR_AGREEMENT_VERSION } from "@/lib/network/vendor-agreement";
import { W9Error, saveUploadedW9 } from "@/lib/network/w9";
import {
  firstZodError,
  freelancerRegisterSchema,
  loginSchema,
  partnerRegisterSchema,
} from "@/lib/network/validation";

export type ActionState = { error?: string; ok?: boolean; detail?: string };

export async function signIn(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { error: "That email and password don't match. Please try again." };
  }

  await setSessionCookie(user.id);
  redirect(roleHome(user));
}

export async function signOut(): Promise<void> {
  await clearSessionCookie();
  redirect("/network/login");
}

export async function registerPartner(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = partnerRegisterSchema.safeParse({
    companyName: formData.get("companyName"),
    contactPerson: formData.get("contactPerson"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    mailingAddress: formData.get("mailingAddress"),
    website: formData.get("website") || undefined,
    bio: formData.get("bio"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };
  const input = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) return { error: "An account with this email already exists." };

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash: await hashPassword(input.password),
      role: "PARTNER",
      status: "PENDING",
      profile: {
        create: {
          name: input.contactPerson,
          companyName: input.companyName,
          contactPerson: input.contactPerson,
          phone: input.phone,
          mailingAddress: input.mailingAddress,
          bio: input.bio,
          type: "BUSINESS",
          socialLinks: input.website ? { website: input.website } : undefined,
        },
      },
    },
  });

  await notifyAdmins(
    prisma,
    "APPLICATION_UPDATE",
    `New partner wants to join: ${input.companyName} (${input.email}).`,
  );

  await setSessionCookie(user.id);
  redirect("/network/pending");
}

export async function registerFreelancer(formData: FormData): Promise<ActionState> {
  const parsed = freelancerRegisterSchema.safeParse({
    type: formData.get("type"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    mailingAddress: formData.get("mailingAddress"),
    bio: formData.get("bio") || undefined,
    password: formData.get("password"),
    companyName: formData.get("companyName") || undefined,
    taxIdLast4: formData.get("taxIdLast4"),
    socialLinks: {
      instagram: formData.get("instagram") || undefined,
      facebook: formData.get("facebook") || undefined,
      tiktok: formData.get("tiktok") || undefined,
      linkedin: formData.get("linkedin") || undefined,
      website: formData.get("website") || undefined,
      email: formData.get("email") || undefined,
    },
    categoryTagIds: formData.getAll("categoryTagIds"),
    tier: formData.get("tier"),
    acceptAgreement: formData.get("acceptAgreement"),
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };
  const input = parsed.data;

  let portrait: string | undefined;
  let w9Url: string | undefined;
  try {
    portrait = await saveUploadedPortrait(formData.get("portrait"));
    w9Url = await saveUploadedW9(formData.get("w9"));
  } catch (err) {
    return {
      error:
        err instanceof PortraitError || err instanceof W9Error
          ? err.message
          : "Could not save that file.",
    };
  }
  if (!w9Url) return { error: "Upload a current IRS Form W-9." };

  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) return { error: "An account with this email already exists." };

  const tagCount = await prisma.categoryTag.count({
    where: { id: { in: input.categoryTagIds } },
  });
  if (tagCount !== input.categoryTagIds.length) {
    return { error: "One or more selected skills are invalid." };
  }

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash: await hashPassword(input.password),
      role: "FREELANCER",
      status: "PENDING",
      profile: {
        create: {
          name: input.name,
          phone: input.phone,
          mailingAddress: input.mailingAddress,
          bio: input.bio,
          companyName: input.type === "BUSINESS" ? input.companyName : undefined,
          type: input.type,
          headshotUrl: input.type === "INDIVIDUAL" ? portrait : undefined,
          logoUrl: input.type === "BUSINESS" ? portrait : undefined,
          taxIdType: input.type === "INDIVIDUAL" ? "SSN" : "EIN",
          taxIdLast4: input.taxIdLast4,
          w9Url,
          vendorAgreementAcceptedAt: new Date(),
          vendorAgreementVersion: VENDOR_AGREEMENT_VERSION,
          socialLinks: input.socialLinks,
          categoryTags: { connect: input.categoryTagIds.map((id) => ({ id })) },
        },
      },
      membership: {
        create: { tier: input.tier, status: "INCOMPLETE" },
      },
      vendorDocuments: {
        create: { kind: "W9", label: "Form W-9", storedKey: w9Url },
      },
    },
  });

  await notifyAdmins(
    prisma,
    "APPLICATION_UPDATE",
    `New vendor wants to join: ${input.name} (${input.email}).`,
  );

  await setSessionCookie(user.id);

  let checkoutUrl: string | null = null;
  try {
    checkoutUrl = await createMembershipCheckout({
      userId: user.id,
      email: user.email,
      tier: input.tier,
    });
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to start checkout.",
    };
  }

  if (checkoutUrl) redirect(checkoutUrl);

  // Offline dev mode: no Stripe keys — activate the chosen tier directly.
  await prisma.membership.update({
    where: { userId: user.id },
    data: { status: "ACTIVE" },
  });
  redirect("/network/join/success?offline=1");
}
