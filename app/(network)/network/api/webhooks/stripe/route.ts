import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/network/prisma";
import {
  getStripe,
  mapSubscriptionStatus,
  subscriptionPeriodEnd,
  tierForPriceId,
} from "@/lib/network/stripe";
import { createNotification } from "@/lib/network/notifications";

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe is not configured." },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;
      if (!userId || !subscriptionId) break;

      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = sub.items.data[0]?.price?.id;

      // A fully-waived checkout (100% coupon) marks the member as a beta tester.
      const fullyWaived = session.amount_total === 0;
      const metadataTier = session.metadata?.tier === "PRO" ? "PRO" : "STANDARD";
      const tier = fullyWaived
        ? "BETA_FREE"
        : (tierForPriceId(priceId) ?? metadataTier);

      await prisma.membership.upsert({
        where: { userId },
        create: {
          userId,
          tier,
          status: mapSubscriptionStatus(sub.status),
          stripeCustomerId:
            typeof session.customer === "string"
              ? session.customer
              : session.customer?.id,
          stripeSubscriptionId: subscriptionId,
          currentPeriodEnd: subscriptionPeriodEnd(sub),
        },
        update: {
          tier,
          status: mapSubscriptionStatus(sub.status),
          stripeCustomerId:
            typeof session.customer === "string"
              ? session.customer
              : session.customer?.id,
          stripeSubscriptionId: subscriptionId,
          currentPeriodEnd: subscriptionPeriodEnd(sub),
        },
      });

      await createNotification(
        prisma,
        userId,
        "APPLICATION_UPDATE",
        fullyWaived
          ? "Beta membership activated — your fee is fully waived."
          : "Membership subscription activated.",
      );
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object;
      const membership = await prisma.membership.findUnique({
        where: { stripeSubscriptionId: sub.id },
      });
      if (!membership) break;

      const status =
        event.type === "customer.subscription.deleted"
          ? "CANCELED"
          : mapSubscriptionStatus(sub.status);

      await prisma.membership.update({
        where: { id: membership.id },
        data: {
          status,
          currentPeriodEnd: subscriptionPeriodEnd(sub),
        },
      });
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
