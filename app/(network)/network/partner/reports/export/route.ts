import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/network/auth";
import { partnerOwnerId } from "@/lib/network/partner-org";
import {
  buildSpendReport,
  parseReportYear,
  vendorYearCsv,
  yearBounds,
} from "@/lib/network/partner-reports";
import { prisma } from "@/lib/network/prisma";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "PARTNER" || user.status !== "APPROVED") {
    return NextResponse.json({ error: "Sign in as a partner to download this." }, { status: 401 });
  }

  const ownerId = await partnerOwnerId(user.id);

  const year = parseReportYear(new URL(request.url).searchParams.get("year") ?? undefined);
  const { start, end } = yearBounds(year);

  const jobs = await prisma.jobOpportunity.findMany({
    where: {
      postedById: ownerId,
      assignedFreelancerId: { not: null },
      status: { in: ["FILLED", "COMPLETED"] },
      vendorPaidAt: { gte: start, lt: end },
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
  });

  const report = buildSpendReport(jobs, year);
  const csv = vendorYearCsv(report);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="hitouch-1099-${year}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
