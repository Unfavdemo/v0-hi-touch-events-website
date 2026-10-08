import type { JobStatus } from "@/lib/generated/network-prisma/client";

export function upcomingWindow(days = 14): { start: Date; end: Date } {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + days);
  return { start, end };
}

export function isStaffingGap(job: {
  status: JobStatus;
  assignedFreelancerId: string | null;
}): boolean {
  return job.status === "ACTIVE" && !job.assignedFreelancerId;
}

export function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}
