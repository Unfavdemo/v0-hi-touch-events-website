import Stripe from "stripe";
import type { MembershipStatus, MembershipTier } from "@/lib/generated/network-prisma/client";

let stripeSingleton: Stripe | null | undefined;

export function getStripe(): Stripe | null {
  if (stripeSingleton !== undefined) return stripeSingleton;
  const key = process.env.STRIPE_SECRET_KEY;
  stripeSingleton = key ? new Stripe(key) : null;
  return stripeSingleton;
}

export function isStripeConfigured(): boolean {
  return getStripe() !== null;
}

export function priceIdForTier(tier: "STANDARD" | "PRO"): string | null {
  const id =
    tier === "STANDARD"
      ? process.env.STRIPE_PRICE_STANDARD
      : process.env.STRIPE_PRICE_PRO;
  return id || null;
}

export function tierForPriceId(priceId: string | null | undefined): MembershipTier | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_STANDARD) return "STANDARD";
  if (priceId === process.env.STRIPE_PRICE_PRO) return "PRO";
  return null;
}

export function mapSubscriptionStatus(status: Stripe.Subscription.Status): MembershipStatus {
  switch (status) {
    case "active":
      return "ACTIVE";
    case "trialing":
      return "TRIALING";
    case "past_due":
      return "PAST_DUE";
    case "incomplete":
      return "INCOMPLETE";
    default:
      return "CANCELED";
  }
}

/** current_period_end lives on subscription items in recent Stripe API versions. */
export function subscriptionPeriodEnd(sub: Stripe.Subscription): Date | null {
  const fromItem = sub.items?.data?.[0]?.current_period_end;
  const legacy = (sub as unknown as { current_period_end?: number }).current_period_end;
  const epoch = fromItem ?? legacy;
  return epoch ? new Date(epoch * 1000) : null;
}

export async function createMembershipCheckout(params: {
  userId: string;
  email: string;
  tier: "STANDARD" | "PRO";
}): Promise<string | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  const priceId = priceIdForTier(params.tier);
  if (!priceId) {
    throw new Error(
      `Stripe price for tier ${params.tier} is not configured (STRIPE_PRICE_${params.tier}).`,
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: params.email,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${appUrl}/join/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/join/freelancer?canceled=1`,
    metadata: { userId: params.userId, tier: params.tier },
    subscription_data: {
      metadata: { userId: params.userId, tier: params.tier },
    },
  });

  return session.url;
}

export async function createBillingPortalSession(params: {
  customerId: string;
  returnUrl: string;
}): Promise<string | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  const session = await stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  });
  return session.url;
}
