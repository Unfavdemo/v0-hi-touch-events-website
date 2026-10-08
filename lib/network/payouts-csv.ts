import type { BidProposal, JobOpportunity, VendorPayMethod } from "@/lib/generated/network-prisma/client";
import { formatDate } from "@/lib/network/utils";
import { hiredPayAmount, isVendorPaid } from "@/lib/network/vendor-pay";

export type PayoutJob = Pick<
  JobOpportunity,
  | "id"
  | "title"
  | "eventStartTime"
  | "payRate"
  | "vendorPaidAt"
  | "vendorPayMethod"
  | "vendorPaidAmount"
  | "vendorPayNote"
> & {
  postedBy: { profile: { name: string | null; companyName: string | null } | null; email: string };
  assignedFreelancer: {
    profile: { name: string | null } | null;
    email: string;
  } | null;
  bids?: Pick<BidProposal, "amount" | "status">[];
  categoryTag?: { name: string };
};

function csvCell(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}

export function buildPayoutsCsv(jobs: PayoutJob[]): string {
  const header = [
    "Opportunity",
    "Date",
    "Partner",
    "Vendor",
    "Category",
    "Amount due",
    "Amount paid",
    "Status",
    "Method",
    "Paid on",
    "Note",
  ];
  const rows = jobs.map((job) => {
    const due = hiredPayAmount(job);
    const paid = isVendorPaid(job);
    return [
      job.title,
      formatDate(job.eventStartTime),
      job.postedBy.profile?.companyName ?? job.postedBy.profile?.name ?? job.postedBy.email,
      job.assignedFreelancer?.profile?.name ?? job.assignedFreelancer?.email ?? "",
      job.categoryTag?.name ?? "",
      due,
      paid ? String(job.vendorPaidAmount ?? due) : "",
      paid ? "Paid" : "Due",
      job.vendorPayMethod ?? "",
      job.vendorPaidAt ? formatDate(job.vendorPaidAt) : "",
      job.vendorPayNote ?? "",
    ].map((cell) => csvCell(String(cell)));
  });
  return [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

export function stripeCustomerUrl(customerId: string): string {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  const test = !key || key.startsWith("sk_test");
  return `https://dashboard.stripe.com/${test ? "test/" : ""}customers/${customerId}`;
}

export function payoutJobInclude() {
  return {
    categoryTag: true,
    postedBy: { include: { profile: true } },
    assignedFreelancer: { include: { profile: true } },
    bids: { where: { status: "ACCEPTED" as const } },
  };
}

export type { VendorPayMethod };
