import Link from "next/link";
import { BrandMark } from "@/components/network/BrandMark";
import { findUserForSetPasswordToken } from "@/lib/network/password-reset";
import { SetPasswordForm } from "./SetPasswordForm";

export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const user = token ? await findUserForSetPasswordToken(token) : null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 sm:py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <BrandMark className="items-center justify-center" />
        </div>
        <div className="border-2 border-ht-line bg-ht-panel p-5 sm:p-6">
          <h1 className="text-2xl font-semibold text-ht-cream">Set your password</h1>
          {!user || !token ? (
            <>
              <p className="mt-2 text-base text-ht-muted">
                This link is invalid or has expired. Ask a HiTouch admin to send a new invite.
              </p>
              <p className="mt-6 text-center text-sm text-ht-muted">
                <Link href="/network/login" className="text-ht-gold hover:text-ht-gold-bright">
                  Back to sign in
                </Link>
              </p>
            </>
          ) : (
            <>
              <p className="mt-1 text-base text-ht-muted">
                Choose a password for{" "}
                <span className="font-medium text-ht-cream">{user.email}</span>, then you&apos;ll
                be signed in.
              </p>
              <div className="mt-6">
                <SetPasswordForm token={token} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
