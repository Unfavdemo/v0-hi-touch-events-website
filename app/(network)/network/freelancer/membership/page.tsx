import { VendorHeader } from "@/components/network/freelancer/VendorHeader";
import { MembershipTip } from "@/components/network/help/Tips";
import { Badge, statusBadgeVariant } from "@/components/network/ui/Badge";
import { requireUser } from "@/lib/network/auth";
import { openMembershipBillingPortal } from "@/lib/network/membership-portal-action";
import { label } from "@/lib/network/labels";
import { isStripeConfigured } from "@/lib/network/stripe";
import { formatDate } from "@/lib/network/utils";

export default async function FreelancerMembershipPage({
  searchParams,
}: {
  searchParams: Promise<{ billing?: string | string[] }>;
}) {
  const user = await requireUser("FREELANCER");
  const membership = user.membership;
  const billingParam = (await searchParams).billing;
  const billingUnavailable = billingParam === "unavailable";

  const canPortal =
    isStripeConfigured() &&
    membership?.stripeCustomerId &&
    membership.tier !== "BETA_FREE";

  return (
    <div className="space-y-8">
      <VendorHeader title="Membership" tip={<MembershipTip />}>
        Stay active to receive invites and apply to opportunities. Pro members get a small boost in
        matching when slots are tight.
      </VendorHeader>

      {billingUnavailable ? (
        <p className="border-2 border-ht-gold bg-ht-panel px-5 py-4 text-sm text-ht-gold">
          Billing self-service isn&apos;t available on this account yet. Contact HiTouch if you
          need to update payment.
        </p>
      ) : null}

      {membership ? (
        <section className="max-w-lg border-2 border-ht-line bg-ht-panel p-6">
          <p className="text-xl font-bold text-ht-gold">{label(membership.tier)} plan</p>
          <Badge className="mt-2" variant={statusBadgeVariant(membership.status)}>
            {label(membership.status)}
          </Badge>
          {membership.currentPeriodEnd ? (
            <p className="mt-4 text-sm text-ht-muted">
              {membership.status === "CANCELED" ? "Access until" : "Renews"}{" "}
              {formatDate(membership.currentPeriodEnd)}
            </p>
          ) : null}
          {membership.tier === "BETA_FREE" ? (
            <p className="mt-4 text-sm text-ht-muted">
              You&apos;re on a complimentary beta membership — no Stripe billing on file.
            </p>
          ) : canPortal ? (
            <form action={openMembershipBillingPortal} className="mt-6">
              <button
                type="submit"
                className="ht-label border-2 border-ht-gold px-4 py-2 text-ht-gold hover:bg-ht-gold hover:text-ht-black"
              >
                Manage billing
              </button>
            </form>
          ) : (
            <p className="mt-4 text-sm text-ht-muted">
              When checkout completes, a Manage billing button appears here.
            </p>
          )}
        </section>
      ) : (
        <p className="text-sm text-ht-muted">No membership on file.</p>
      )}
    </div>
  );
}
