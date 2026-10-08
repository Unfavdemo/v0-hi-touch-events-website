import Link from "next/link";
import type { JobStatus } from "@/lib/generated/network-prisma/client";
import { cn } from "@/lib/network/utils";

export type EventFilter = "current" | "pending" | "active" | "filled" | "completed";
export type EventAudience = "partner" | "vendor" | "admin";

export const EVENT_FILTERS: { value: EventFilter; label: string }[] = [
  { value: "current", label: "Current" },
  { value: "pending", label: "Pending approval" },
  { value: "active", label: "Active" },
  { value: "filled", label: "Filled" },
  { value: "completed", label: "Completed" },
];

const FILTER_STATUS: Record<Exclude<EventFilter, "current">, JobStatus> = {
  pending: "PENDING_APPROVAL",
  active: "ACTIVE",
  filled: "FILLED",
  completed: "COMPLETED",
};

const DESCRIPTIONS: Record<EventAudience, Record<EventFilter, string>> = {
  partner: {
    current: "Everything that hasn't happened yet. Completed opportunities move to their own tab.",
    pending: "HiTouch is verifying your opportunity. Vendors can't see it yet.",
    active: "Live. Invites are out and vendors can apply.",
    filled: "You hired someone. Remaining invites are closed.",
    completed: "The opportunity happened. Leave a review for your vendor.",
  },
  vendor: {
    current: "Upcoming bookings plus opportunities you shared. Finished opportunities move to Completed.",
    pending: "Opportunities you shared that HiTouch is still verifying.",
    active: "Opportunities you shared that are live and taking applications.",
    filled: "Booked — you were hired, or an opportunity you shared was filled.",
    completed: "Finished opportunities. Reviews are open.",
  },
  admin: {
    current: "Every opportunity that hasn't finished yet.",
    pending: "Waiting on your approval. Approving invites the top matches automatically.",
    active: "Live with invites out. Vendors are applying.",
    filled: "A vendor was hired. Mark complete once the opportunity wraps.",
    completed: "Finished. Make sure both reviews are in.",
  },
};

export function parseEventFilter(raw: string | string[] | undefined): EventFilter {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return EVENT_FILTERS.some((f) => f.value === value) ? (value as EventFilter) : "current";
}

export function matchesEventFilter(status: JobStatus, filter: EventFilter): boolean {
  return filter === "current" ? status !== "COMPLETED" : status === FILTER_STATUS[filter];
}

export function countEventFilters(statuses: JobStatus[]): Record<EventFilter, number> {
  return Object.fromEntries(
    EVENT_FILTERS.map((f) => [f.value, statuses.filter((s) => matchesEventFilter(s, f.value)).length]),
  ) as Record<EventFilter, number>;
}

function filterHref(basePath: string, filter: EventFilter): string {
  return filter === "current" ? basePath : `${basePath}?status=${filter}`;
}

interface TabsProps {
  basePath: string;
  current: EventFilter;
  counts: Record<EventFilter, number>;
  audience: EventAudience;
}

export function EventStatusTabs({ basePath, current, counts, audience }: TabsProps) {
  return (
    <div>
      <nav aria-label="Filter opportunities by status" className="flex flex-wrap gap-2">
        {EVENT_FILTERS.map((f) => {
          const selected = f.value === current;
          return (
            <Link
              key={f.value}
              href={filterHref(basePath, f.value)}
              scroll={false}
              aria-current={selected ? "page" : undefined}
              className={cn(
                "ht-label inline-flex items-center gap-2 border-2 px-3 py-1.5 transition-colors",
                selected
                  ? "border-ht-blue bg-ht-blue text-white"
                  : "border-ht-line bg-ht-panel text-ht-muted hover:border-ht-blue hover:text-ht-blue",
              )}
            >
              {f.label}
              <span
                className={cn(
                  "min-w-5 px-1 py-0.5 text-center text-[0.7rem] leading-none",
                  selected ? "bg-white text-ht-blue" : "bg-ht-line text-ht-cream",
                )}
              >
                {counts[f.value]}
              </span>
            </Link>
          );
        })}
      </nav>
      <p className="mt-3 text-sm text-ht-muted">{DESCRIPTIONS[audience][current]}</p>
    </div>
  );
}

/** Admin-only summary: one clickable card per status. */
export function EventStatusOverview({
  basePath,
  counts,
  current,
}: {
  basePath: string;
  counts: Record<EventFilter, number>;
  current?: EventFilter;
}) {
  return (
    <ul className="grid gap-px border-2 border-ht-line bg-ht-line sm:grid-cols-2 xl:grid-cols-5">
      {EVENT_FILTERS.map((f) => {
        const selected = f.value === current;
        const needsAction = f.value === "pending" && counts.pending > 0;
        return (
          <li key={f.value}>
            <Link
              href={filterHref(basePath, f.value)}
              scroll={false}
              aria-current={selected ? "page" : undefined}
              className={cn(
                "flex h-full flex-col p-4 transition-colors",
                selected ? "bg-ht-blue text-white" : "bg-ht-panel hover:bg-ht-panel-2",
              )}
            >
              <span
                className={cn(
                  "ht-label",
                  selected ? "text-white/80" : needsAction ? "text-ht-gold" : "text-ht-muted",
                )}
              >
                {f.label}
              </span>
              <span
                className={cn(
                  "mt-1 text-3xl font-bold",
                  selected ? "text-white" : "text-ht-cream",
                )}
              >
                {counts[f.value]}
              </span>
              <span
                className={cn(
                  "mt-1 text-xs leading-snug",
                  selected ? "text-white/80" : "text-ht-muted",
                )}
              >
                {DESCRIPTIONS.admin[f.value]}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
