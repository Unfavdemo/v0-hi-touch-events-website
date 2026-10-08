import { redirect } from "next/navigation";
import { BrandMark } from "@/components/network/BrandMark";
import { Badge, statusBadgeVariant } from "@/components/network/ui/Badge";
import { getCurrentUser, roleHome } from "@/lib/network/auth";
import { signOut } from "@/lib/network/auth-actions";
import { label } from "@/lib/network/labels";

const STATUS_COPY: Record<string, { title: string; body: string }> = {
  PENDING: {
    title: "Application under review",
    body: "The HiTouch Solutions team manually reviews every application. You'll be notified as soon as a decision is made — no action needed.",
  },
  REJECTED: {
    title: "Application not approved",
    body: "Your application was not approved at this time. You can reach out to the HiTouch Solutions team if you believe this was in error.",
  },
  SUSPENDED: {
    title: "Membership suspended",
    body: "Your access is suspended pending review. Contact the HiTouch Solutions team for next steps.",
  },
};

export default async function PendingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/network/login");
  if (user.status === "APPROVED") redirect(roleHome(user));

  const copy = STATUS_COPY[user.status] ?? STATUS_COPY.PENDING;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <BrandMark className="items-center justify-center" />
      <div className="mt-10 w-full max-w-lg border-2 border-ht-line bg-ht-panel p-8">
        <div className="flex items-center justify-between gap-3">
          <p className="ht-label text-ht-muted">Application status</p>
          <Badge variant={statusBadgeVariant(user.status)}>{label(user.status)}</Badge>
        </div>
        <h1 className="mt-4 text-2xl font-bold text-ht-cream">{copy.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-ht-muted">{copy.body}</p>

        <dl className="mt-6 space-y-2 border-t-2 border-ht-line pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-ht-muted">Account</dt>
            <dd className="text-ht-cream">{user.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ht-muted">Joining as</dt>
            <dd className="text-ht-cream">{label(user.role)}</dd>
          </div>
          {user.membership ? (
            <div className="flex justify-between">
              <dt className="text-ht-muted">Membership</dt>
              <dd className="text-ht-cream">
                {label(user.membership.tier)} · {label(user.membership.status)}
              </dd>
            </div>
          ) : null}
        </dl>

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
