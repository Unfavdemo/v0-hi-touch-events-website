import Link from "next/link";
import { Badge, eventStatusLabel, statusBadgeVariant } from "@/components/network/ui/Badge";
import { requirePartnerOrg } from "@/lib/network/partner-org";
import {
  daysSpanned,
  monthGrid,
  monthLabel,
  parseYearMonth,
  shiftYearMonth,
} from "@/lib/network/calendar";
import { checkInLabel } from "@/lib/network/checkin";
import { prisma } from "@/lib/network/prisma";
import { cn, formatTimeOn } from "@/lib/network/utils";

export default async function PartnerCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string | string[] }>;
}) {
  const { ownerId } = await requirePartnerOrg();
  const { year, month } = parseYearMonth((await searchParams).month);
  const grid = monthGrid(year, month);
  const rangeStart = grid[0]!.date;
  const rangeEnd = new Date(grid[grid.length - 1]!.date);
  rangeEnd.setDate(rangeEnd.getDate() + 1);

  const jobs = await prisma.jobOpportunity.findMany({
    where: {
      postedById: ownerId,
      eventStartTime: { lt: rangeEnd },
      eventEndTime: { gte: rangeStart },
    },
    include: { categoryTag: true },
    orderBy: { eventStartTime: "asc" },
  });

  const byDay = new Map<string, typeof jobs>();
  for (const job of jobs) {
    for (const iso of daysSpanned(job.eventStartTime, job.eventEndTime)) {
      const list = byDay.get(iso) ?? [];
      list.push(job);
      byDay.set(iso, list);
    }
  }

  const prev = shiftYearMonth(year, month, -1);
  const next = shiftYearMonth(year, month, 1);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="ht-label text-ht-blue-bright">Partner</p>
          <h1 className="mt-1 text-3xl font-bold text-ht-cream">{monthLabel(year, month)}</h1>
          <p className="mt-2 max-w-2xl text-sm text-ht-muted">
            Opportunities land on the days they&apos;re live. Open one to hire, duplicate, or mark it
            done.{" "}
            <Link href="/network/partner" className="text-ht-gold hover:text-ht-gold-bright">
              List view
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/network/partner/calendar?month=${prev}`}
            className="ht-label border-2 border-ht-line px-4 py-2 text-ht-muted hover:border-ht-gold hover:text-ht-gold"
          >
            Previous
          </Link>
          <Link
            href="/network/partner/calendar"
            className="ht-label border-2 border-ht-line px-4 py-2 text-ht-muted hover:border-ht-gold hover:text-ht-gold"
          >
            Today
          </Link>
          <Link
            href={`/network/partner/calendar?month=${next}`}
            className="ht-label border-2 border-ht-line px-4 py-2 text-ht-muted hover:border-ht-gold hover:text-ht-gold"
          >
            Next
          </Link>
        </div>
      </header>

      <div className="overflow-x-auto border-2 border-ht-line">
        <div className="grid min-w-[52rem] grid-cols-7 bg-ht-line gap-px">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="bg-ht-panel px-3 py-2">
              <p className="ht-label text-ht-muted">{d}</p>
            </div>
          ))}
          {grid.map((day) => {
            const events = byDay.get(day.iso) ?? [];
            return (
              <div
                key={day.iso}
                className={cn(
                  "min-h-28 bg-ht-panel p-2",
                  !day.inMonth && "opacity-40",
                  day.isToday && "ring-2 ring-inset ring-ht-gold",
                )}
              >
                <p className={cn("text-sm", day.isToday ? "font-bold text-ht-gold" : "text-ht-muted")}>
                  {day.date.getDate()}
                </p>
                <ul className="mt-1 space-y-1">
                  {events.map((job) => (
                    <li key={job.id}>
                      <Link
                        href={`/network/partner/jobs/${job.id}`}
                        className="block border border-ht-line bg-ht-panel-2 px-1.5 py-1 hover:border-ht-gold"
                      >
                        <span className="block truncate text-xs font-medium text-ht-cream">
                          {job.title}
                        </span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-1">
                          <Badge variant={statusBadgeVariant(job.status)}>
                            {eventStatusLabel(job.status)}
                          </Badge>
                          {checkInLabel(job) ? (
                            <Badge variant="blue">{checkInLabel(job)}</Badge>
                          ) : null}
                          <span className="text-[0.65rem] text-ht-muted">
                            {formatTimeOn(job.eventStartTime, job.eventStartTime)}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
