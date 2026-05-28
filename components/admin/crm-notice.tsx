import { CRM_NOTICES } from "@/lib/crm/admin-copy"
import { cn } from "@/lib/utils"

export function CrmNotice({ code }: { code: string | null | undefined }) {
  if (!code) return null
  const entry = CRM_NOTICES[code]
  if (!entry) return null

  return (
    <div
      role="status"
      className={cn(
        "mb-8 rounded-lg border px-4 py-3 text-sm",
        entry.tone === "success" && "border-emerald-500/40 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100",
        entry.tone === "info" && "border-border bg-muted/40 text-foreground",
        entry.tone === "warning" && "border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-100"
      )}
    >
      {entry.message}
    </div>
  )
}
