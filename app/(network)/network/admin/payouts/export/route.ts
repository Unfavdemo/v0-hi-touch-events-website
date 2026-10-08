import { NextResponse } from "next/server";
import { adminJobsWhere } from "@/lib/network/admin-rbac";
import { getCurrentUser } from "@/lib/network/auth";
import { buildPayoutsCsv } from "@/lib/network/payouts-csv";
import { prisma } from "@/lib/network/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN" || user.status !== "APPROVED") {
    return NextResponse.json({ error: "Sign in as an admin to export payouts." }, { status: 401 });
  }

  const jobs = await prisma.jobOpportunity.findMany({
    where: {
      ...adminJobsWhere(user),
      assignedFreelancerId: { not: null },
      status: { in: ["FILLED", "COMPLETED"] },
    },
    include: {
      categoryTag: true,
      postedBy: { include: { profile: true } },
      assignedFreelancer: { include: { profile: true } },
      bids: { where: { status: "ACCEPTED" } },
    },
    orderBy: { eventStartTime: "desc" },
  });

  const csv = buildPayoutsCsv(jobs);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="hitouch-payouts.csv"',
      "Cache-Control": "private, no-store",
    },
  });
}
