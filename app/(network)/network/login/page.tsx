import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/network/BrandMark";
import { getCurrentUser, roleHome } from "@/lib/network/auth";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(roleHome(user));

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <BrandMark className="items-center justify-center" />
        </div>
        <div className="border-2 border-ht-line bg-ht-panel p-6">
          <h1 className="text-2xl font-semibold text-ht-cream">Welcome back</h1>
          <p className="mt-1 text-base text-ht-muted">
            Sign in to your HiTouch account — partners, vendors, and the HiTouch team all
            start here.
          </p>
          <div className="mt-6">
            <LoginForm />
          </div>
        </div>
        <div className="mt-6 border border-ht-line bg-ht-panel-2 p-4 text-sm text-ht-cream">
          <p className="ht-label text-ht-gold">Demo logins (seed)</p>
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
        <p className="mt-6 text-center text-sm text-ht-muted">
          Not a member yet?{" "}
          <Link href="/network/join" className="text-ht-gold hover:text-ht-gold-bright">
            Request to join
          </Link>
        </p>
      </div>
    </div>
  );
}
