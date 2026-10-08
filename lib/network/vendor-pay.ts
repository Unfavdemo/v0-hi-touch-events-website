import type { BidProposal, JobOpportunity, VendorPayMethod } from "@/lib/generated/network-prisma/client";

export const VENDOR_PAY_METHODS: { value: VendorPayMethod; label: string }[] = [
  { value: "CHECK", label: "Check" },
  { value: "ACH", label: "Bank transfer" },
  { value: "CARD", label: "Card" },
  { value: "CASH", label: "Cash" },
  { value: "OTHER", label: "Other" },
];

export function hiredPayAmount(
  job: Pick<JobOpportunity, "payRate"> & { bids?: Pick<BidProposal, "amount" | "status">[] },
): string {
  const accepted = job.bids?.find((b) => b.status === "ACCEPTED");
  return (accepted?.amount ?? job.payRate).toString();
}

export function isVendorPaid(job: Pick<JobOpportunity, "vendorPaidAt">): boolean {
  return Boolean(job.vendorPaidAt);
}
