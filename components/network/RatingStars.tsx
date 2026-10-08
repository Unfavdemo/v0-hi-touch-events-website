import { cn } from "@/lib/network/utils";

interface RatingStarsProps {
  value: number | null;
  count?: number;
  className?: string;
}

export function RatingStars({ value, count, className }: RatingStarsProps) {
  if (value === null) {
    return (
      <span className={cn("text-sm text-ht-muted", className)}>Not yet rated</span>
    );
  }
  const rounded = Math.round(value);
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span aria-hidden className="tracking-tight">
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className={i < rounded ? "text-ht-gold" : "text-ht-line-strong"}
          >
            ★
          </span>
        ))}
      </span>
      <span className="text-sm font-semibold text-ht-cream">{value.toFixed(2)}</span>
      {typeof count === "number" ? (
        <span className="text-xs text-ht-muted">
          ({count} review{count === 1 ? "" : "s"})
        </span>
      ) : null}
    </span>
  );
}
