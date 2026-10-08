import type { BidProposal, CategoryTag, JobOpportunity, Profile, User } from "@/lib/generated/network-prisma/client";
import { parseReportYear, yearBounds } from "@/lib/network/partner-reports";
import { hiredPayAmount, isVendorPaid } from "@/lib/network/vendor-pay";

export { parseReportYear, yearBounds };

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export type VendorEarningsJob = JobOpportunity & {
  categoryTag: CategoryTag;
  postedBy: User & { profile: Profile | null };
  bids: Pick<BidProposal, "amount" | "status">[];
};

export interface PartnerEarningsRow {
  partnerId: string;
  name: string;
  paid: number;
  outstanding: number;
  events: number;
}

export interface VendorEarningsReport {
  year: number;
  paidTotal: number;
  paidCount: number;
  outstandingTotal: number;
  outstandingCount: number;
  byMonth: { month: number; label: string; paid: number; outstanding: number }[];
  partners: PartnerEarningsRow[];
}

function paidAmount(job: VendorEarningsJob): number {
  return Number(job.vendorPaidAmount ?? hiredPayAmount(job));
}

function inYear(date: Date, start: Date, end: Date): boolean {
  return date >= start && date < end;
}

export function buildVendorEarningsReport(
  jobs: VendorEarningsJob[],
  year: number,
): VendorEarningsReport {
  const { start, end } = yearBounds(year);
  const byMonth = MONTH_LABELS.map((label, month) => ({
    month,
    label,
    paid: 0,
    outstanding: 0,
  }));
  const partnerMap = new Map<string, PartnerEarningsRow>();

  let paidTotal = 0;
  let paidCount = 0;
  let outstandingTotal = 0;
  let outstandingCount = 0;

  for (const job of jobs) {
    const anchor = job.vendorPaidAt ?? job.eventStartTime;
    if (!inYear(anchor, start, end)) continue;

    const amount = paidAmount(job);
    const month = anchor.getMonth();
    const partnerId = job.postedById;
    const partnerName =
      job.postedBy.profile?.companyName ?? job.postedBy.profile?.name ?? "Partner";

    let row = partnerMap.get(partnerId);
    if (!row) {
      row = { partnerId, name: partnerName, paid: 0, outstanding: 0, events: 0 };
      partnerMap.set(partnerId, row);
    }
    row.events += 1;

    if (isVendorPaid(job)) {
      paidTotal += amount;
      paidCount += 1;
      byMonth[month]!.paid += amount;
      row.paid += amount;
    } else {
      outstandingTotal += amount;
      outstandingCount += 1;
      byMonth[month]!.outstanding += amount;
      row.outstanding += amount;
    }
  }

  return {
    year,
    paidTotal,
    paidCount,
    outstandingTotal,
    outstandingCount,
    byMonth,
    partners: [...partnerMap.values()].sort((a, b) => b.paid + b.outstanding - (a.paid + a.outstanding)),
  };
}
