import type { PrismaClient } from "@/lib/generated/network-prisma/client";

/** Stable title — find this job in Payments / Payouts after seed or reset. */
export const PAYOUT_TEST_JOB_TITLE = "Payout tester — Staff DJ";

function daysFromNow(days: number, hour: number, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

/** Completed hire, not marked paid — for partner, admin, and vendor payout UI. */
export async function ensurePayoutTestFixture(db: PrismaClient) {
  const [partner, vendor, eventAdmin, superAdmin, tag] = await Promise.all([
    db.user.findUnique({ where: { email: "partner@vestedin.example" } }),
    db.user.findUnique({ where: { email: "marcus.dj@example.com" } }),
    db.user.findUnique({ where: { email: "events.admin@hitouch.io" } }),
    db.user.findUnique({ where: { email: "admin@hitouch.io" } }),
    db.categoryTag.findFirst({ where: { name: "DJ" } }),
  ]);
  if (!partner || !vendor || !eventAdmin || !superAdmin || !tag) {
    throw new Error("Run npm run db:seed first (partner, Marcus, admins, DJ tag).");
  }

  let job = await db.jobOpportunity.findFirst({ where: { title: PAYOUT_TEST_JOB_TITLE } });
  if (!job) {
    job = await db.jobOpportunity.create({
      data: {
        title: PAYOUT_TEST_JOB_TITLE,
        description:
          "Demo completed opportunity for payout testing. Mark paid from partner Payments, admin Payouts, or the opportunity page.",
        categoryTagId: tag.id,
        payRate: 725,
        location: "Philadelphia, PA — payout test venue",
        setupTime: daysFromNow(-3, 15, 0),
        eventStartTime: daysFromNow(-3, 18, 0),
        eventEndTime: daysFromNow(-3, 22, 0),
        breakdownTime: daysFromNow(-3, 22, 30),
        isOpenBidding: false,
        status: "COMPLETED",
        postedById: partner.id,
        assignedFreelancerId: vendor.id,
      },
    });
  } else {
    job = await db.jobOpportunity.update({
      where: { id: job.id },
      data: {
        status: "COMPLETED",
        assignedFreelancerId: vendor.id,
        postedById: partner.id,
      },
    });
  }

  await db.eventDelegation.upsert({
    where: { jobId_adminId: { jobId: job.id, adminId: eventAdmin.id } },
    update: {},
    create: {
      jobId: job.id,
      adminId: eventAdmin.id,
      delegatedById: superAdmin.id,
    },
  });

  return job;
}

export async function resetPayoutTestJob(db: PrismaClient, jobId: string): Promise<void> {
  await db.jobOpportunity.update({
    where: { id: jobId },
    data: {
      vendorPaidAt: null,
      vendorPayMethod: null,
      vendorPaidAmount: null,
      vendorPayNote: null,
    },
  });
}

export async function markPayoutTestJobPaid(
  db: PrismaClient,
  jobId: string,
  amount: number,
): Promise<void> {
  await db.jobOpportunity.update({
    where: { id: jobId },
    data: {
      vendorPaidAt: new Date(),
      vendorPayMethod: "ACH",
      vendorPaidAmount: amount,
      vendorPayNote: "Payout test — automated mark",
    },
  });
}
