import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/network/BrandMark";
import { getCurrentUser, roleHome } from "@/lib/network/auth";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(roleHome(user));

  const showDemoLogins = process.env.NODE_ENV !== "production";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 sm:py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <BrandMark className="items-center justify-center" size="lg" />
        </div>
        <div className="border border-ht-line bg-ht-panel p-5 shadow-sm sm:p-6">
          <h1 className="font-display text-3xl tracking-[0.12em] text-ht-brand uppercase">
            Welcome back
          </h1>
          <p className="mt-2 text-base text-ht-muted">
            Sign in to HiTouch Events — Staffing. For HiTouch staff and vendors.
          </p>
          <div className="mt-6">
            <LoginForm />
          </div>
        </div>
        {showDemoLogins ? (
          <div className="mt-6 border border-ht-line bg-ht-panel-2 p-4 text-sm text-ht-cream">
            <p className="ht-label text-ht-brand">Demo logins (seed)</p>
            <ul className="mt-3 space-y-2 text-ht-muted">
              <li>
                <span className="font-medium text-ht-cream">Admin</span>
                <br />
                admin@hitouch.io / hitouch-admin-2026
              </li>
              <li>
                <span className="font-medium text-ht-cream">Vendor</span>
                <br />
                marcus.dj@example.com / freelancer-demo-2026
              </li>
            </ul>
          </div>
        ) : null}
        <p className="mt-6 text-center text-sm text-ht-muted">
          Vendor not on the bench yet?{" "}
          <Link href="/network/join/freelancer" className="text-ht-brand hover:text-ht-gold-bright">
            Request to join
          </Link>
        </p>
      </div>
    </div>
  );
}
