import { redirect } from "next/navigation";
import { BrandMark } from "@/components/network/BrandMark";
import { Badge, statusBadgeVariant } from "@/components/network/ui/Badge";
import { getCurrentUser, hasActiveMembership } from "@/lib/network/auth";
import { signOut } from "@/lib/network/auth-actions";
import { label } from "@/lib/network/labels";

export default async function MembershipRequiredPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/network/login");
  if (user.role !== "FREELANCER") redirect("/network/login");
  if (user.status !== "APPROVED") redirect("/network/pending");
  if (hasActiveMembership(user)) redirect("/network/freelancer");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <BrandMark className="items-center justify-center" />
      <div className="mt-10 w-full max-w-lg border-2 border-ht-gold/60 bg-ht-panel p-8">
        <p className="ht-label text-ht-gold">Membership required</p>
        <h1 className="mt-3 text-2xl font-bold text-ht-cream">
          Your subscription isn&apos;t active
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ht-muted">
          Your application is approved, but the vendor portal needs an active
          membership.
          {user.membership
            ? " Here's where your membership stands:"
            : " We couldn't find a membership on your account yet."}
        </p>
        {user.membership ? (
          <div className="mt-4 flex items-center gap-3 border-2 border-ht-line bg-ht-panel-2 px-4 py-3">
            <span className="font-semibold text-ht-cream">
              {label(user.membership.tier)} plan
            </span>
            <Badge variant={statusBadgeVariant(user.membership.status)}>
              {label(user.membership.status)}
            </Badge>
          </div>
        ) : null}
        <p className="mt-4 text-sm text-ht-muted">
          If you just completed checkout, this updates automatically within a minute.
          Otherwise contact the HiTouch Solutions team to restore billing.
        </p>
        <form action={signOut} className="mt-8">
          <button
            type="submit"
            className="ht-label border-2 border-ht-line px-4 py-2 text-ht-muted hover:border-ht-danger hover:text-ht-danger"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
