"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/network/auth";
import { createBillingPortalSession, isStripeConfigured } from "@/lib/network/stripe";

export async function openMembershipBillingPortal() {
  const user = await requireUser("FREELANCER");
  const customerId = user.membership?.stripeCustomerId;
  if (!isStripeConfigured() || !customerId) {
    redirect("/network/freelancer/membership?billing=unavailable");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const url = await createBillingPortalSession({
    customerId,
    returnUrl: `${appUrl}/freelancer/membership`,
  });
  if (!url) redirect("/network/freelancer/membership?billing=unavailable");
  redirect(url);
}
