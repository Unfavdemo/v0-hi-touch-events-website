import Link from "next/link"

export type AdminFilterSelect = {
  name: string
  label: string
  options: { value: string; label: string }[]
  value?: string
}

export function AdminFilters({
  basePath,
  q = "",
  searchPlaceholder = "Search name, email, text…",
  selects = [],
  resultCount,
  resultLabel = "results",
}: {
  basePath: string
  q?: string
  searchPlaceholder?: string
  selects?: AdminFilterSelect[]
  resultCount?: number
  resultLabel?: string
}) {
  const hasFilters = Boolean(q?.trim()) || selects.some((s) => s.value)

  return (
    <div className="mt-8 space-y-3">
      <form method="get" action={basePath} className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-muted/10 p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="admin-filter-q" className="text-xs text-muted-foreground">
            Search
          </label>
          <input
            id="admin-filter-q"
            type="search"
            name="q"
            defaultValue={q}
            placeholder={searchPlaceholder}
            className="mt-1 w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
          />
        </div>
        {selects.map((field) => (
          <div key={field.name}>
            <label htmlFor={`admin-filter-${field.name}`} className="text-xs text-muted-foreground">
              {field.label}
            </label>
            <select
              id={`admin-filter-${field.name}`}
              name={field.name}
              defaultValue={field.value ?? ""}
              className="mt-1 block min-w-[140px] rounded border border-border bg-background px-2 py-1.5 text-sm"
            >
              {field.options.map((opt) => (
                <option key={opt.value || `__${field.name}`} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}
        <button
          type="submit"
          className="font-display rounded-full border-2 border-brand bg-brand/10 px-4 py-2 text-[10px] uppercase tracking-[0.2em] hover:bg-brand/20"
        >
          Apply
        </button>
        {hasFilters ? (
          <Link
            href={basePath}
            className="pb-2 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Clear all
          </Link>
        ) : null}
      </form>
      {typeof resultCount === "number" ? (
        <p className="text-xs text-muted-foreground">
          {resultCount} {resultLabel}
          {hasFilters ? " matching filters" : ""}
        </p>
      ) : null}
    </div>
  )
}
