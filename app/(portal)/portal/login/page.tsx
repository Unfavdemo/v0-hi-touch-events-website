import Link from "next/link"
import { PortalLoginForm } from "@/components/portal/portal-login-form"

export const metadata = {
  title: "Portal sign in | HiTouch",
  robots: { index: false, follow: false },
}

export default function PortalLoginPage() {
  return (
    <main className="mx-auto min-h-svh max-w-lg px-6 py-16 text-center">
      <p className="font-display text-[10px] uppercase tracking-[0.28em] text-muted-foreground">HiTouch portal</p>
      <h1 className="font-display mt-4 text-2xl font-normal uppercase tracking-tight">Sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Client and vendor accounts use a secure email link. Staff should use{" "}
        <Link href="/admin/login" className="text-brand-ink hover:underline">
          admin sign-in
        </Link>
        .
      </p>
      <PortalLoginForm />
    </main>
  )
}
