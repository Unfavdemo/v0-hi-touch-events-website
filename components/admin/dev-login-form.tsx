import { signInWithDevCredentials } from "@/app/(admin)/admin/login/actions"

/** Local-only email/password form (uses `AUTH_DEV_PASSWORD` in `.env`). */
export function DevLoginForm({ defaultEmail = "" }: { defaultEmail?: string }) {
  const hintEmail = defaultEmail.trim().toLowerCase()

  return (
    <form action={signInWithDevCredentials} className="space-y-3 rounded-lg border border-dashed border-border p-4">
      <p className="font-display text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        Local dev sign-in (no Google)
      </p>
      {hintEmail ? (
        <p className="text-xs text-muted-foreground">
          Use an allowlisted email (e.g. <span className="text-foreground">{hintEmail}</span>) and{" "}
          <code className="text-foreground">AUTH_DEV_PASSWORD</code> from <code className="text-foreground">.env</code>.
        </p>
      ) : null}
      <input
        name="email"
        type="email"
        required
        autoComplete="email"
        defaultValue={hintEmail}
        placeholder="Allowlisted email"
        className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
      />
      <input
        name="password"
        type="password"
        required
        autoComplete="current-password"
        placeholder="AUTH_DEV_PASSWORD"
        className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
      />
      <button
        type="submit"
        className="font-display w-full rounded-full border border-border py-3 text-[10px] uppercase tracking-[0.28em] transition-colors hover:border-brand"
      >
        Sign in (dev)
      </button>
    </form>
  )
}
