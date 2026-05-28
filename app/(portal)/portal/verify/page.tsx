import Link from "next/link"

export const metadata = {
  title: "Check your email | HiTouch",
  robots: { index: false, follow: false },
}

export default function PortalVerifyPage() {
  return (
    <main className="mx-auto min-h-svh max-w-lg px-6 py-16 text-center">
      <h1 className="font-display text-2xl font-normal uppercase tracking-tight">Check your email</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        A sign-in link has been sent if your address is registered for portal access.
      </p>
      <Link href="/portal/login" className="mt-8 inline-block text-sm text-brand-ink hover:underline">
        Back to sign in
      </Link>
    </main>
  )
}
