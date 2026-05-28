import { createContact } from "@/lib/actions/crm"

export function CreateContactForm({ companies }: { companies: { id: string; name: string }[] }) {
  return (
    <form id="add-contact" action={createContact} className="mt-8 max-w-xl space-y-3 rounded-lg border border-border p-4">
      <h2 className="font-display text-sm uppercase tracking-[0.28em] text-brand-ink">Create contact</h2>
      <div>
        <label className="text-xs text-muted-foreground">Email</label>
        <input name="email" type="email" required className="mt-1 w-full rounded border border-border bg-background px-2 py-1.5 text-sm" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs text-muted-foreground">First name</label>
          <input name="firstName" className="mt-1 w-full rounded border border-border bg-background px-2 py-1.5 text-sm" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Last name</label>
          <input name="lastName" className="mt-1 w-full rounded border border-border bg-background px-2 py-1.5 text-sm" />
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Company</label>
        <select name="companyId" defaultValue="__none__" className="mt-1 w-full rounded border border-border bg-background px-2 py-1.5 text-sm">
          <option value="__none__">— None —</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="font-display rounded-full border-2 border-brand px-4 py-2 text-[10px] uppercase tracking-[0.2em]">
        Create
      </button>
    </form>
  )
}
