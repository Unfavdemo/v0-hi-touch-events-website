import type { JobStatus } from "@/lib/generated/network-prisma/client";

const ARRIVE_EARLY_MS = 4 * 60 * 60 * 1000;
const ARRIVE_LATE_MS = 3 * 60 * 60 * 1000;

export function checkInWindow(job: { setupTime: Date; breakdownTime: Date }): {
  open: Date;
  close: Date;
} {
  return {
    open: new Date(job.setupTime.getTime() - ARRIVE_EARLY_MS),
    close: new Date(job.breakdownTime.getTime() + ARRIVE_LATE_MS),
  };
}

export function canMarkArrived(
  job: {
    status: JobStatus;
    vendorArrivedAt: Date | null;
    setupTime: Date;
    breakdownTime: Date;
  },
  now = new Date(),
): boolean {
  if (job.status !== "FILLED" || job.vendorArrivedAt) return false;
  const { open, close } = checkInWindow(job);
  return now >= open && now <= close;
}

export function canMarkWrapped(
  job: {
    status: JobStatus;
    vendorArrivedAt: Date | null;
    vendorWrappedAt: Date | null;
  },
): boolean {
  return job.status === "FILLED" && Boolean(job.vendorArrivedAt) && !job.vendorWrappedAt;
}

export function checkInLabel(job: {
  vendorArrivedAt: Date | null;
  vendorWrappedAt: Date | null;
}): string | null {
  if (job.vendorWrappedAt) return "Wrapped";
  if (job.vendorArrivedAt) return "On site";
  return null;
}
