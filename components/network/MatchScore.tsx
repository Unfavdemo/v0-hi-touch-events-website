import { cn } from "@/lib/network/utils";

export function MatchScore({
  value,
  label = "match",
  className,
}: {
  value: number;
  label?: string;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("w-28 text-right", className)}>
      <p className="text-xl font-bold text-ht-gold">
        {Math.round(pct)}
        <span className="ml-1 text-xs font-normal text-ht-muted">{label}</span>
      </p>
      <div className="mt-1 h-1.5 w-full bg-ht-panel-2">
        <div className="h-full bg-ht-blue" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
