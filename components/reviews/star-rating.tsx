import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

export function StarRating({
  rating,
  max = 5,
  size = "md",
  className,
}: {
  rating: number
  max?: number
  size?: "sm" | "md"
  className?: string
}) {
  const clamped = Math.min(max, Math.max(0, Math.round(rating)))
  const iconClass = size === "sm" ? "size-3.5" : "size-4"

  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-label={`${clamped} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < clamped
        return (
          <Star
            key={i}
            className={cn(iconClass, filled ? "fill-amber-400 text-amber-400" : "fill-muted/30 text-muted-foreground/40")}
            aria-hidden
          />
        )
      })}
    </div>
  )
}
