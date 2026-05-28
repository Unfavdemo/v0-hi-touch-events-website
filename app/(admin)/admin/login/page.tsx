import Link from "next/link"
import { redirect } from "next/navigation"
import { DevLoginForm } from "@/components/admin/dev-login-form"
import { firstBootstrapEmail } from "@/lib/auth/dev-login"
import { getGoogleOAuthEnv, isAuthSecretConfigured, isDevPasswordLoginEnabled } from "@/lib/auth/env"
import { getSessionSafe } from "@/lib/auth-session"
import { signInWithGoogle } from "./actions"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Admin sign in | HiTouch Enterprises Inc.",
  robots: { index: false, follow: false },
}

export default async function AdminLoginPage() {
  const session = await getSessionSafe()
  if (session?.user) {
    redirect("/admin")
  }

  const googleConfigured = getGoogleOAuthEnv().configured
  const secretOk = isAuthSecretConfigured()
  const devLogin = isDevPasswordLoginEnabled()

  return (
    <main id="admin-main" className="mx-auto max-w-sm px-6 py-20">
      <p className="font-display text-xs uppercase tracking-[0.35em] text-brand-ink">Admin</p>
      <h1 className="font-display mt-3 text-3xl font-normal uppercase tracking-tight">Sign in</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Dashboard access is restricted to authorized HiTouch Google accounts.
      </p>
      <div className="mt-10 space-y-4">
        {!secretOk ? (
          <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            Add <code className="text-foreground">AUTH_SECRET</code> to <code className="text-foreground">.env</code>{" "}
            (generate: <code className="text-foreground">openssl rand -base64 32</code>), then restart{" "}
            <code className="text-foreground">npm run dev</code>.
          </p>
        ) : null}

        {googleConfigured ? (
          <form action={signInWithGoogle}>
            <button
              type="submit"
              className="font-display w-full rounded-full border-2 border-brand bg-brand/10 py-3.5 text-[10px] font-normal uppercase tracking-[0.28em] text-foreground transition-colors hover:bg-brand/20"
            >
              Continue with Google
            </button>
          </form>
        ) : (
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Google OAuth is not configured yet. Add <code className="text-foreground">AUTH_GOOGLE_ID</code> and{" "}
              <code className="text-foreground">AUTH_GOOGLE_SECRET</code> from Google Cloud Console (OAuth client → Web
              application). Authorized redirect URI:
            </p>
            <p className="break-all rounded bg-muted px-2 py-1 font-mono text-xs text-foreground">
              {process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000"}
              /api/auth/callback/google
            </p>
          </div>
        )}

        {devLogin ? <DevLoginForm defaultEmail={firstBootstrapEmail()} /> : null}
        <Link
          href="/"
          className="font-display block text-center text-[10px] font-normal uppercase tracking-[0.28em] text-muted-foreground transition-colors hover:text-brand-ink"
        >
          ← Back to site
        </Link>
      </div>
    </main>
  )
}
