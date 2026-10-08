import Link from "next/link";
import { Badge } from "@/components/network/ui/Badge";
import { ReportsTip } from "@/components/network/help/Tips";
import { label } from "@/lib/network/labels";
import { requirePartnerOrg } from "@/lib/network/partner-org";
import {
  NEC_THRESHOLD,
  buildSpendReport,
  parseReportYear,
  yearBounds,
} from "@/lib/network/partner-reports";
import { prisma } from "@/lib/network/prisma";
import { cn, formatMoney } from "@/lib/network/utils";

export default async function PartnerReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string | string[] }>;
}) {
  const { ownerId } = await requirePartnerOrg();
  const thisYear = new Date().getFullYear();
  const year = parseReportYear((await searchParams).year, thisYear);
  const { start, end } = yearBounds(year);

  const [jobs, earliest] = await Promise.all([
    prisma.jobOpportunity.findMany({
      where: {
        postedById: ownerId,
        assignedFreelancerId: { not: null },
        status: { in: ["FILLED", "COMPLETED"] },
        OR: [
          { vendorPaidAt: { gte: start, lt: end } },
          { eventStartTime: { gte: start, lt: end } },
        ],
      },
      include: {
        categoryTag: true,
        assignedFreelancer: {
          include: {
            profile: true,
            vendorDocuments: {
              where: { kind: "W9" },
              orderBy: { updatedAt: "desc" },
              take: 1,
            },
          },
        },
        bids: { where: { status: "ACCEPTED" } },
      },
    }),
    prisma.jobOpportunity.findFirst({
      where: { postedById: ownerId, assignedFreelancerId: { not: null } },
      orderBy: { eventStartTime: "asc" },
      select: { eventStartTime: true, vendorPaidAt: true },
    }),
  ]);

  const report = buildSpendReport(jobs, year);
  const firstYear = earliest
    ? Math.min(
        earliest.eventStartTime.getFullYear(),
        earliest.vendorPaidAt?.getFullYear() ?? thisYear,
      )
    : thisYear;
  const years: number[] = [];
  for (let y = thisYear; y >= firstYear; y--) years.push(y);
  if (!years.includes(year)) years.push(year);
  years.sort((a, b) => b - a);

  const maxMonth = Math.max(
    1,
    ...report.byMonth.map((m) => m.paid + m.outstanding),
  );
  const necVendors = report.vendors.filter((v) => v.necRequired);
  const below = report.vendors.filter((v) => !v.necRequired);

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="ht-label text-ht-blue-bright">Partner</p>
          <h1 className="mt-1 inline-flex flex-wrap items-center gap-2 text-3xl font-bold text-ht-cream">
            Reports
            <ReportsTip />
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-ht-muted">
            Spend is based on payments you marked on Payments. The 1099 list uses the calendar
            year you paid — not the opportunity date. HiTouch does not file forms for you.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {years.map((y) => (
            <Link
              key={y}
              href={y === thisYear ? "/partner/reports" : `/partner/reports?year=${y}`}
              className={cn(
                "ht-label border-2 px-3 py-1.5",
                y === year
                  ? "border-ht-blue bg-ht-blue text-white"
                  : "border-ht-line text-ht-muted hover:border-ht-gold hover:text-ht-gold",
              )}
            >
              {y}
            </Link>
          ))}
          <Link
            href={`/network/partner/reports/export?year=${year}`}
            className="ht-label border-2 border-ht-gold px-3 py-1.5 text-ht-gold hover:bg-ht-gold hover:text-white"
          >
            Download CSV
          </Link>
        </div>
      </header>

      <section className="grid gap-5 sm:grid-cols-3">
        <div className="border-2 border-ht-line bg-ht-panel p-5">
          <h2 className="ht-label text-ht-muted">Marked paid in {year}</h2>
          <p className="mt-3 text-2xl font-bold text-ht-gold">{formatMoney(report.paidTotal)}</p>
          <p className="mt-1 text-sm text-ht-muted">
            {report.paidCount} payment{report.paidCount === 1 ? "" : "s"}
          </p>
        </div>
        <div className="border-2 border-ht-line bg-ht-panel p-5">
          <h2 className="ht-label text-ht-muted">Still to pay ({year} opportunities)</h2>
          <p className="mt-3 text-2xl font-bold text-ht-cream">
            {formatMoney(report.outstandingTotal)}
          </p>
          <p className="mt-1 text-sm text-ht-muted">
            {report.outstandingCount} hire{report.outstandingCount === 1 ? "" : "s"}
          </p>
        </div>
        <div className="border-2 border-ht-line bg-ht-panel p-5">
          <h2 className="ht-label text-ht-muted">1099-NEC likely</h2>
          <p className="mt-3 text-2xl font-bold text-ht-cream">{necVendors.length}</p>
          <p className="mt-1 text-sm text-ht-muted">
            Vendors at ${NEC_THRESHOLD}+ this year
          </p>
        </div>
      </section>

      <section>
        <h2 className="ht-label text-ht-muted">By month</h2>
        {report.paidCount === 0 && report.outstandingCount === 0 ? (
          <p className="mt-4 border-2 border-ht-line bg-ht-panel px-5 py-8 text-center text-sm text-ht-muted">
            No hired opportunities in {year} yet. Mark payments on{" "}
            <Link href="/network/partner/payments" className="text-ht-gold hover:text-ht-gold-bright">
              Payments
            </Link>{" "}
            to fill this in.
          </p>
        ) : (
          <div className="mt-4 border-2 border-ht-line bg-ht-panel p-5">
            <div className="flex h-40 items-end gap-1">
              {report.byMonth.map((m) => {
                const paidH = (m.paid / maxMonth) * 100;
                const dueH = (m.outstanding / maxMonth) * 100;
                return (
                  <div key={m.month} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                    <div className="flex h-32 w-full flex-col justify-end gap-px">
                      {m.outstanding > 0 ? (
                        <div
                          className="w-full bg-ht-blue-dim"
                          style={{ height: `${dueH}%` }}
                          title={`${m.label} still to pay ${formatMoney(m.outstanding)}`}
                        />
                      ) : null}
                      {m.paid > 0 ? (
                        <div
                          className="w-full bg-ht-blue"
                          style={{ height: `${Math.max(paidH, m.paid > 0 ? 4 : 0)}%` }}
                          title={`${m.label} paid ${formatMoney(m.paid)}`}
                        />
                      ) : null}
                    </div>
                    <span className="ht-label text-[0.65rem] text-ht-muted">{m.label}</span>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-ht-muted">
              <span className="mr-3 inline-block h-2 w-3 bg-ht-blue align-middle" /> Paid
              <span className="ml-4 mr-3 inline-block h-2 w-3 bg-ht-blue-dim align-middle" />{" "}
              Still to pay
            </p>
          </div>
        )}
      </section>

      {report.byCategory.length > 0 ? (
        <section>
          <h2 className="ht-label text-ht-muted">By category</h2>
          <ul className="mt-4 divide-y-2 divide-ht-line border-2 border-ht-line bg-ht-panel">
            {report.byCategory.map((row) => (
              <li key={row.name} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <span className="font-medium text-ht-cream">{row.name}</span>
                <span className="text-sm text-ht-muted">
                  {row.count} payment{row.count === 1 ? "" : "s"} · {formatMoney(row.paid)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <h2 className="ht-label text-ht-muted">1099 summary ({year})</h2>
        <p className="mt-2 max-w-2xl text-sm text-ht-muted">
          IRS Form 1099-NEC is generally required when you pay an independent contractor{" "}
          ${NEC_THRESHOLD} or more in a calendar year. Confirm names and TINs against each
          W-9. This is a worksheet, not a filed return.
        </p>
        {report.vendors.length === 0 ? (
          <p className="mt-4 text-sm text-ht-muted">No marked payments in {year}.</p>
        ) : (
          <ul className="mt-4 divide-y-2 divide-ht-line border-2 border-ht-line bg-ht-panel">
            {report.vendors.map((v) => (
              <li key={v.vendorId} className="px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/network/${v.vendorId}`}
                      className="font-semibold text-ht-cream hover:text-ht-gold"
                    >
                      {v.name}
                    </Link>
                    <p className="mt-1 text-sm text-ht-muted">
                      {v.companyName ? `${v.companyName} · ` : ""}
                      {label(v.type)}
                      {v.taxIdType && v.taxIdLast4
                        ? ` · ${label(v.taxIdType)} ending ${v.taxIdLast4}`
                        : ""}
                      {` · ${v.events} opportunit${v.events === 1 ? "y" : "ies"}`}
                    </p>
                    {v.mailingAddress ? (
                      <p className="mt-1 text-sm text-ht-muted">{v.mailingAddress}</p>
                    ) : (
                      <p className="mt-1 text-sm text-ht-danger">No mailing address on file.</p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-lg font-bold text-ht-gold">{formatMoney(v.paid)}</span>
                    {v.necRequired ? (
                      <Badge variant="gold">1099 likely</Badge>
                    ) : (
                      <Badge>Under ${NEC_THRESHOLD}</Badge>
                    )}
                    {v.w9Id ? (
                      <a
                        href={`/api/vendor-documents/${v.w9Id}`}
                        className="ht-label border-2 border-ht-gold px-3 py-1.5 text-ht-gold hover:bg-ht-gold hover:text-white"
                        target="_blank"
                        rel="noreferrer"
                      >
                        W-9
                      </a>
                    ) : (
                      <span className="text-xs text-ht-muted">No W-9</span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        {below.length > 0 && necVendors.length > 0 ? (
          <p className="mt-3 text-xs text-ht-muted">
            {below.length} vendor{below.length === 1 ? "" : "s"} under ${NEC_THRESHOLD} — still
            listed so your records stay complete.
          </p>
        ) : null}
      </section>
    </div>
  );
}
