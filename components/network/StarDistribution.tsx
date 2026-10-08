import { cn } from "@/lib/network/utils";

interface StarDistributionProps {
  counts: Record<number, number>;
  total: number;
}

export function StarDistribution({ counts, total }: StarDistributionProps) {
  return (
    <ul className="space-y-2">
      {[5, 4, 3, 2, 1].map((stars) => {
        const n = counts[stars] ?? 0;
        const pct = total > 0 ? Math.round((n / total) * 100) : 0;
        return (
          <li key={stars} className="flex items-center gap-3 text-sm">
            <span className="ht-label w-10 shrink-0 text-ht-muted">{stars} ★</span>
            <div className="h-2 flex-1 border border-ht-line bg-ht-black">
              <div
                className={cn("h-full bg-ht-gold", pct === 0 && "bg-transparent")}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-8 text-right text-xs text-ht-muted">{n}</span>
          </li>
        );
      })}
    </ul>
  );
}
