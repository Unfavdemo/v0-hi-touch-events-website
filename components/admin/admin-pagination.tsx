import Link from "next/link"

export function AdminPagination({
  basePath,
  page,
  pageSize,
  total,
  searchParams,
}: {
  basePath: string
  page: number
  pageSize: number
  total: number
  searchParams: Record<string, string | undefined>
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  if (totalPages <= 1) return null

  function hrefFor(p: number) {
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(searchParams)) {
      if (v) params.set(k, v)
    }
    if (p > 1) params.set("page", String(p))
    else params.delete("page")
    const q = params.toString()
    return q ? `${basePath}?${q}` : basePath
  }

  return (
    <nav className="mt-6 flex items-center justify-between gap-4 text-sm" aria-label="Pagination">
      <p className="text-muted-foreground">
        Page {page} of {totalPages} · {total} total
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={hrefFor(page - 1)} className="rounded border border-border px-3 py-1 text-[10px] uppercase tracking-[0.2em] hover:bg-muted/30">
            Previous
          </Link>
        ) : null}
        {page < totalPages ? (
          <Link href={hrefFor(page + 1)} className="rounded border border-border px-3 py-1 text-[10px] uppercase tracking-[0.2em] hover:bg-muted/30">
            Next
          </Link>
        ) : null}
      </div>
    </nav>
  )
}
