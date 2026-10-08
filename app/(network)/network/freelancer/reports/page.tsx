import Link from "next/link";
import { VendorHeader } from "@/components/network/freelancer/VendorHeader";
import { VendorReportsTip } from "@/components/network/help/Tips";
import { requireUser } from "@/lib/network/auth";
import { prisma } from "@/lib/network/prisma";
import {
  buildVendorEarningsReport,
  parseReportYear,
  yearBounds,
} from "@/lib/network/vendor-earnings";
import { cn, formatMoney } from "@/lib/network/utils";

export default async function FreelancerReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string | string[] }>;
}) {
  const user = await requireUser("FREELANCER");
  const thisYear = new Date().getFullYear();
  const year = parseReportYear((await searchParams).year, thisYear);
  const { start, end } = yearBounds(year);

  const [jobs, earliest] = await Promise.all([
    prisma.jobOpportunity.findMany({
      where: {
        assignedFreelancerId: user.id,
        status: { in: ["FILLED", "COMPLETED"] },
        OR: [
          { vendorPaidAt: { gte: start, lt: end } },
          { eventStartTime: { gte: start, lt: end } },
        ],
      },
      include: {
        categoryTag: true,
        postedBy: { include: { profile: true } },
        bids: { where: { status: "ACCEPTED" } },
      },
    }),
    prisma.jobOpportunity.findFirst({
      where: { assignedFreelancerId: user.id },
      orderBy: { eventStartTime: "asc" },
      select: { eventStartTime: true },
    }),
  ]);

  const report = buildVendorEarningsReport(jobs, year);
  const firstYear = earliest?.eventStartTime.getFullYear() ?? thisYear;
  const years: number[] = [];
  for (let y = thisYear; y >= firstYear; y--) years.push(y);

  const maxMonth = Math.max(1, ...report.byMonth.map((m) => m.paid + m.outstanding));

  return (
    <div className="space-y-10">
      <VendorHeader title="Reports" tip={<VendorReportsTip />}>
        Year-to-date paid and outstanding amounts from partners who hired you. Use this for
        your records; tax forms come from each client when they pay you enough in a calendar
        year.
      </VendorHeader>

      <YearPicker years={years} year={year} />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Paid this year" value={formatMoney(report.paidTotal)} sub={`${report.paidCount} opportunities`} />
        <Stat
          label="Outstanding"
          value={formatMoney(report.outstandingTotal)}
          sub={`${report.outstandingCount} opportunities`}
        />
      </div>

      <section>
        <h2 className="ht-label text-ht-muted">By month</h2>
        <p className="mt-1 text-xs text-ht-muted">Gold = paid · Gray = still open</p>
        <ul className="mt-4 flex items-end gap-1 border-2 border-ht-line bg-ht-panel px-4 py-6">
          {report.byMonth.map((m) => {
            const total = m.paid + m.outstanding;
            return (
              <li key={m.month} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex w-full flex-col justify-end" style={{ height: "6rem" }}>
                  {m.outstanding > 0 ? (
                    <div
                      className="w-full bg-ht-muted/40"
                      style={{ height: `${Math.round((m.outstanding / maxMonth) * 96)}px` }}
                      title={`Outstanding ${formatMoney(m.outstanding)}`}
                    />
                  ) : null}
                  {m.paid > 0 ? (
                    <div
                      className="w-full bg-ht-gold"
                      style={{ height: `${Math.round((m.paid / maxMonth) * 96)}px` }}
                      title={`Paid ${formatMoney(m.paid)}`}
                    />
                  ) : null}
                  {total === 0 ? <div className="h-1 w-full bg-ht-line" /> : null}
                </div>
                <span className="text-[0.65rem] text-ht-muted">{m.label}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="ht-label text-ht-muted">By client</h2>
        {report.partners.length === 0 ? (
          <p className="mt-4 border-2 border-dashed border-ht-line px-5 py-8 text-center text-sm text-ht-muted">
            No hired opportunities in {year} yet. Amounts appear here after partners book you.
          </p>
        ) : (
          <ul className="mt-4 divide-y-2 divide-ht-line border-2 border-ht-line bg-ht-panel">
            {report.partners.map((p) => (
              <li key={p.partnerId} className="flex flex-wrap justify-between gap-3 px-5 py-4">
                <div>
                  <p className="font-semibold text-ht-cream">{p.name}</p>
                  <p className="text-sm text-ht-muted">{p.events} opportunit{p.events === 1 ? "y" : "ies"}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="text-ht-gold">Paid {formatMoney(p.paid)}</p>
                  {p.outstanding > 0 ? (
                    <p className="text-ht-muted">Open {formatMoney(p.outstanding)}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-sm text-ht-muted">
        <Link href="/network/freelancer/payments" className="text-ht-gold hover:text-ht-gold-bright">
          Payments
        </Link>{" "}
        lists each opportunity and Gusto payroll rows.
      </p>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="border-2 border-ht-line bg-ht-panel p-5">
      <p className="ht-label text-ht-muted">{label}</p>
      <p className="mt-2 text-2xl font-bold text-ht-cream">{value}</p>
      <p className="mt-1 text-sm text-ht-muted">{sub}</p>
    </div>
  );
}

function YearPicker({ years, year }: { years: number[]; year: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      {years.map((y) => (
        <Link
          key={y}
          href={`/network/freelancer/reports?year=${y}`}
          className={cn(
            "ht-label border-2 px-4 py-2",
            y === year
              ? "border-ht-gold bg-ht-gold text-ht-black"
              : "border-ht-line text-ht-muted hover:border-ht-gold hover:text-ht-gold",
          )}
        >
          {y}
        </Link>
      ))}
    </div>
  );
}
