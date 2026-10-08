import type { BidProposal, CategoryTag, JobOpportunity, Profile, User, VendorDocument } from "@/lib/generated/network-prisma/client";
import { hiredPayAmount, isVendorPaid } from "@/lib/network/vendor-pay";

/** IRS 1099-NEC reporting threshold for nonemployee compensation. */
export const NEC_THRESHOLD = 600;

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function parseReportYear(raw: string | string[] | undefined, fallback = new Date().getFullYear()): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const year = Number(value);
  if (!Number.isInteger(year) || year < 2000 || year > 2100) return fallback;
  return year;
}

export function yearBounds(year: number): { start: Date; end: Date } {
  return { start: new Date(year, 0, 1), end: new Date(year + 1, 0, 1) };
}

function inYear(date: Date, start: Date, end: Date): boolean {
  return date >= start && date < end;
}

function paidAmount(job: JobOpportunity & { bids?: Pick<BidProposal, "amount" | "status">[] }): number {
  return Number(job.vendorPaidAmount ?? hiredPayAmount(job));
}

export type ReportJob = JobOpportunity & {
  categoryTag: CategoryTag;
  assignedFreelancer: (User & {
    profile: Profile | null;
    vendorDocuments: Pick<VendorDocument, "id">[];
  }) | null;
  bids: Pick<BidProposal, "amount" | "status">[];
};

export interface VendorYearRow {
  vendorId: string;
  name: string;
  companyName: string | null;
  email: string;
  type: "INDIVIDUAL" | "BUSINESS";
  mailingAddress: string | null;
  taxIdLast4: string | null;
  taxIdType: "SSN" | "EIN" | null;
  w9Id: string | null;
  paid: number;
  events: number;
  necRequired: boolean;
}

export interface SpendReport {
  year: number;
  paidTotal: number;
  paidCount: number;
  outstandingTotal: number;
  outstandingCount: number;
  byMonth: { month: number; label: string; paid: number; outstanding: number }[];
  byCategory: { name: string; paid: number; count: number }[];
  vendors: VendorYearRow[];
}

export function buildSpendReport(jobs: ReportJob[], year: number): SpendReport {
  const { start, end } = yearBounds(year);
  const byMonth = MONTH_LABELS.map((label, month) => ({
    month,
    label,
    paid: 0,
    outstanding: 0,
  }));
  const categoryMap = new Map<string, { name: string; paid: number; count: number }>();
  const vendorMap = new Map<string, VendorYearRow>();

  let paidTotal = 0;
  let paidCount = 0;
  let outstandingTotal = 0;
  let outstandingCount = 0;

  for (const job of jobs) {
    const vendor = job.assignedFreelancer;
    const amount = paidAmount(job);
    const paidThisYear = Boolean(job.vendorPaidAt && inYear(job.vendorPaidAt, start, end));
    const eventThisYear = inYear(job.eventStartTime, start, end);

    if (paidThisYear) {
      paidTotal += amount;
      paidCount += 1;
      byMonth[job.vendorPaidAt!.getMonth()]!.paid += amount;
      const cat = categoryMap.get(job.categoryTagId) ?? {
        name: job.categoryTag.name,
        paid: 0,
        count: 0,
      };
      cat.paid += amount;
      cat.count += 1;
      categoryMap.set(job.categoryTagId, cat);

      if (vendor) {
        const row = vendorMap.get(vendor.id) ?? {
          vendorId: vendor.id,
          name: vendor.profile?.name ?? vendor.email,
          companyName: vendor.profile?.companyName ?? null,
          email: vendor.email,
          type: vendor.profile?.type ?? "INDIVIDUAL",
          mailingAddress: vendor.profile?.mailingAddress ?? null,
          taxIdLast4: vendor.profile?.taxIdLast4 ?? null,
          taxIdType: vendor.profile?.taxIdType ?? null,
          w9Id: vendor.vendorDocuments[0]?.id ?? null,
          paid: 0,
          events: 0,
          necRequired: false,
        };
        row.paid += amount;
        row.events += 1;
        vendorMap.set(vendor.id, row);
      }
    } else if (eventThisYear && !isVendorPaid(job)) {
      outstandingTotal += Number(hiredPayAmount(job));
      outstandingCount += 1;
      byMonth[job.eventStartTime.getMonth()]!.outstanding += Number(hiredPayAmount(job));
    }
  }

  const vendors = [...vendorMap.values()]
    .map((v) => ({ ...v, necRequired: v.paid >= NEC_THRESHOLD }))
    .sort((a, b) => b.paid - a.paid || a.name.localeCompare(b.name));

  const byCategory = [...categoryMap.values()].sort((a, b) => b.paid - a.paid);

  return {
    year,
    paidTotal,
    paidCount,
    outstandingTotal,
    outstandingCount,
    byMonth,
    byCategory,
    vendors,
  };
}

export function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}

export function vendorYearCsv(report: SpendReport): string {
  const header = [
    "Vendor",
    "Company",
    "Email",
    "Type",
    "Mailing address",
    "TIN type",
    "TIN last 4",
    "Amount paid",
    "Opportunities",
    "1099-NEC likely",
  ];
  const rows = report.vendors.map((v) =>
    [
      csvEscape(v.name),
      csvEscape(v.companyName ?? ""),
      csvEscape(v.email),
      v.type,
      csvEscape(v.mailingAddress ?? ""),
      v.taxIdType ?? "",
      v.taxIdLast4 ?? "",
      v.paid.toFixed(2),
      String(v.events),
      v.necRequired ? "Yes" : "No",
    ].join(","),
  );
  return [header.join(","), ...rows].join("\n") + "\n";
}
