import Link from "next/link";
import { BlackoutForm } from "@/components/network/freelancer/BlackoutForm";
import { VendorHeader } from "@/components/network/freelancer/VendorHeader";
import { VendorCalendarTip } from "@/components/network/help/Tips";
import { DeleteBlackoutButton } from "@/components/network/freelancer/DeleteBlackoutButton";
import { Badge, eventStatusLabel, statusBadgeVariant } from "@/components/network/ui/Badge";
import { requireUser } from "@/lib/network/auth";
import {
  daysSpanned,
  monthGrid,
  monthLabel,
  parseYearMonth,
  shiftYearMonth,
} from "@/lib/network/calendar";
import { prisma } from "@/lib/network/prisma";
import { cn, formatTimeOn } from "@/lib/network/utils";

export default async function FreelancerCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string | string[] }>;
}) {
  const user = await requireUser("FREELANCER");
  const { year, month } = parseYearMonth((await searchParams).month);
  const grid = monthGrid(year, month);
  const rangeStart = grid[0]!.date;
  const rangeEnd = new Date(grid[grid.length - 1]!.date);
  rangeEnd.setDate(rangeEnd.getDate() + 1);

  const [assigned, invites, blackouts] = await Promise.all([
    prisma.jobOpportunity.findMany({
      where: {
        assignedFreelancerId: user.id,
        setupTime: { lt: rangeEnd },
        breakdownTime: { gt: rangeStart },
      },
      include: { categoryTag: true },
      orderBy: { eventStartTime: "asc" },
    }),
    prisma.jobInvite.findMany({
      where: {
        freelancerId: user.id,
        status: "PENDING",
        job: {
          status: "ACTIVE",
          setupTime: { lt: rangeEnd },
          breakdownTime: { gt: rangeStart },
        },
      },
      include: { job: { include: { categoryTag: true } } },
    }),
    prisma.vendorBlackout.findMany({
      where: {
        vendorId: user.id,
        startAt: { lt: rangeEnd },
        endAt: { gt: rangeStart },
      },
      orderBy: { startAt: "asc" },
    }),
  ]);

  const byDay = new Map<string, { booked: typeof assigned; invited: typeof invites }>();

  for (const job of assigned) {
    for (const iso of daysSpanned(job.setupTime, job.breakdownTime)) {
      const bucket = byDay.get(iso) ?? { booked: [], invited: [] };
      bucket.booked.push(job);
      byDay.set(iso, bucket);
    }
  }
  for (const inv of invites) {
    for (const iso of daysSpanned(inv.job.setupTime, inv.job.breakdownTime)) {
      const bucket = byDay.get(iso) ?? { booked: [], invited: [] };
      if (!bucket.invited.some((i) => i.jobId === inv.jobId)) {
        bucket.invited.push(inv);
      }
      byDay.set(iso, bucket);
    }
  }

  const blackoutsByDay = new Map<string, typeof blackouts>();
  for (const b of blackouts) {
    for (const iso of daysSpanned(b.startAt, b.endAt)) {
      const list = blackoutsByDay.get(iso) ?? [];
      list.push(b);
      blackoutsByDay.set(iso, list);
    }
  }

  const prev = shiftYearMonth(year, month, -1);
  const next = shiftYearMonth(year, month, 1);

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          <VendorHeader
            title={monthLabel(year, month)}
            tip={<VendorCalendarTip />}
          >
            Booked opportunities, open invites, and blocked time. Add blackouts so matching skips
            overlapping windows.
          </VendorHeader>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/network/freelancer/calendar?month=${prev}`}
            className="ht-label border-2 border-ht-line px-4 py-2 text-ht-muted hover:border-ht-gold hover:text-ht-gold"
          >
            Previous
          </Link>
          <Link
            href="/network/freelancer/calendar"
            className="ht-label border-2 border-ht-line px-4 py-2 text-ht-muted hover:border-ht-gold hover:text-ht-gold"
          >
            Today
          </Link>
          <Link
            href={`/network/freelancer/calendar?month=${next}`}
            className="ht-label border-2 border-ht-line px-4 py-2 text-ht-muted hover:border-ht-gold hover:text-ht-gold"
          >
            Next
          </Link>
        </div>
      </header>

      <div className="flex flex-wrap gap-4 text-xs text-ht-muted">
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-6 border border-ht-blue bg-ht-blue/20" />
          Booked
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-6 border border-ht-line bg-ht-panel-2" />
          Invite pending
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-6 border border-dashed border-ht-muted/60" />
          Blackout
        </span>
      </div>

      <div className="overflow-x-auto border-2 border-ht-line">
        <div className="grid min-w-[52rem] grid-cols-7 bg-ht-line gap-px">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="bg-ht-panel px-3 py-2">
              <p className="ht-label text-ht-muted">{d}</p>
            </div>
          ))}
          {grid.map((day) => {
            const bucket = byDay.get(day.iso) ?? { booked: [], invited: [] };
            const blocks = blackoutsByDay.get(day.iso) ?? [];
            return (
              <div
                key={day.iso}
                className={cn(
                  "min-h-28 bg-ht-panel p-2",
                  !day.inMonth && "opacity-40",
                  day.isToday && "ring-2 ring-inset ring-ht-gold",
                )}
              >
                <p
                  className={cn(
                    "text-sm",
                    day.isToday ? "font-bold text-ht-gold" : "text-ht-muted",
                  )}
                >
                  {day.date.getDate()}
                </p>
                <ul className="mt-1 space-y-1">
                  {blocks.map((b) => (
                    <li
                      key={b.id}
                      className="border border-dashed border-ht-muted/60 bg-ht-panel-2 px-1.5 py-1 text-xs text-ht-muted"
                    >
                      {b.label ?? "Blocked"}
                    </li>
                  ))}
                  {bucket.booked.map((job) => (
                    <li key={job.id}>
                      <Link
                        href={`/network/freelancer/jobs/${job.id}`}
                        className="block border border-ht-blue bg-ht-blue/20 px-1.5 py-1 hover:border-ht-gold"
                      >
                        <span className="block truncate text-xs font-medium text-ht-cream">
                          {job.title}
                        </span>
                        <Badge className="mt-0.5" variant={statusBadgeVariant(job.status)}>
                          {eventStatusLabel(job.status)}
                        </Badge>
                      </Link>
                    </li>
                  ))}
                  {bucket.invited.map((inv) => (
                    <li key={inv.id}>
                      <Link
                        href={`/network/freelancer/jobs/${inv.jobId}`}
                        className="block border border-ht-line bg-ht-panel-2 px-1.5 py-1 hover:border-ht-gold"
                      >
                        <span className="block truncate text-xs font-medium text-ht-cream">
                          Invite · {inv.job.title}
                        </span>
                        <span className="text-[0.65rem] text-ht-muted">
                          {formatTimeOn(inv.job.eventStartTime, inv.job.eventStartTime)}
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

      <section className="grid gap-8 lg:grid-cols-2">
        <BlackoutForm />
        <div className="border-2 border-ht-line bg-ht-panel p-5">
          <h2 className="text-lg font-semibold text-ht-cream">Your blackouts</h2>
          {blackouts.length === 0 ? (
            <p className="mt-4 text-sm text-ht-muted">No blocked dates in this month.</p>
          ) : (
            <ul className="mt-4 divide-y-2 divide-ht-line">
              {blackouts.map((b) => (
                <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div className="text-sm text-ht-cream">
                    {b.label ?? "Blocked"}
                    <p className="text-ht-muted">
                      {b.startAt.toLocaleDateString()} – {b.endAt.toLocaleDateString()}
                    </p>
                  </div>
                  <DeleteBlackoutButton blackoutId={b.id} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
