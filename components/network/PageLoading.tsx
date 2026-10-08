/** Skeleton shown inside the dashboard while a page loads. */
export function PageLoading() {
  return (
    <div role="status" aria-live="polite" className="animate-pulse space-y-8">
      <span className="sr-only">Loading…</span>
      <div className="space-y-3">
        <div className="h-3 w-20 bg-ht-line" />
        <div className="h-8 w-72 max-w-full bg-ht-line" />
      </div>
      <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(19rem,1fr))]">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-56 border-2 border-ht-line bg-ht-panel" />
        ))}
      </div>
    </div>
  );
}
