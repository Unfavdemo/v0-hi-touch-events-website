import type { JobOpportunity, MembershipStatus, MembershipTier, Prisma } from "@/lib/generated/network-prisma/client";
import { vendorPaperworkComplete } from "@/lib/network/paperwork";
import { DEFAULT_INVITE_TARGET, getPlatformSettings } from "@/lib/network/platform-settings";
import { prisma } from "@/lib/network/prisma";

/** Default invite target used in help copy. Live matching reads platform settings. */
export const INVITE_TARGET = DEFAULT_INVITE_TARGET;

export const WEIGHTS = {
  quality: 0.35,
  experience: 0.15,
  partnerFit: 0.15,
  responsiveness: 0.15,
  rotation: 0.1,
  priority: 0.1,
} as const;

export type ScoreFactor = keyof typeof WEIGHTS;

export interface VendorMatch {
  freelancerId: string;
  name: string;
  companyName: string | null;
  type: "INDIVIDUAL" | "BUSINESS";
  headshotUrl: string | null;
  logoUrl: string | null;
  ratingAvg: number | null;
  ratingCount: number;
  completedInCategory: number;
  available: boolean;
  /** 0–100 */
  score: number;
  breakdown: Record<ScoreFactor, number>;
  reasons: string[];
}

export interface ApplicantMatch extends VendorMatch {
  bidId: string;
  amount: number;
  notes: string | null;
  invited: boolean;
  priceFit: number;
  /** 0–100, blends vendor match with price */
  applicantScore: number;
}

type JobWindow = Pick<
  JobOpportunity,
  "id" | "categoryTagId" | "postedById" | "setupTime" | "breakdownTime" | "payRate"
>;

const DAY_MS = 24 * 60 * 60 * 1000;
const RATING_PRIOR = 4.0;
const RATING_PRIOR_WEIGHT = 3;

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function membershipActive(m: { tier: MembershipTier; status: MembershipStatus } | null): boolean {
  if (!m) return false;
  if (m.tier === "BETA_FREE") return true;
  return m.status === "ACTIVE" || m.status === "TRIALING";
}

/**
 * Scores vendors for one opportunity. With no `onlyIds`, candidates are every approved,
 * paid-up, non-flagged vendor tagged with the opportunity's category. Vendors booked on an
 * overlapping setup→breakdown window are returned with `available: false`.
 */
export async function scoreVendorsForJob(
  job: JobWindow,
  onlyIds?: string[],
): Promise<VendorMatch[]> {
  const where: Prisma.UserWhereInput = onlyIds
    ? { id: { in: onlyIds } }
    : {
        role: "FREELANCER",
        status: "APPROVED",
        id: { not: job.postedById },
        profile: {
          flaggedForDismissal: false,
          categoryTags: { some: { id: job.categoryTagId } },
        },
      };

  const vendors = await prisma.user.findMany({
    where,
    include: { profile: true, membership: true },
  });
  const roster = await prisma.partnerVendor.findMany({
    where: { partnerId: job.postedById },
    select: { vendorId: true, favorite: true, blocked: true },
  });
  const blockedIds = new Set(roster.filter((r) => r.blocked).map((r) => r.vendorId));
  const favoriteIds = new Set(roster.filter((r) => r.favorite).map((r) => r.vendorId));

  const eligible = onlyIds
    ? vendors.filter((v) => v.profile)
    : vendors.filter(
        (v) =>
          v.profile &&
          !blockedIds.has(v.id) &&
          membershipActive(v.membership) &&
          vendorPaperworkComplete(v.profile),
      );
  if (eligible.length === 0) return [];
  const ids = eligible.map((v) => v.id);

  const [conflicts, assignments, partnerReviews, inviteStats, blackoutRows] = await Promise.all([
    prisma.jobOpportunity.findMany({
      where: {
        id: { not: job.id },
        assignedFreelancerId: { in: ids },
        status: { in: ["ACTIVE", "FILLED"] },
        setupTime: { lt: job.breakdownTime },
        breakdownTime: { gt: job.setupTime },
      },
      select: { assignedFreelancerId: true },
    }),
    prisma.jobOpportunity.findMany({
      where: {
        assignedFreelancerId: { in: ids },
        status: { in: ["FILLED", "COMPLETED"] },
      },
      select: {
        assignedFreelancerId: true,
        categoryTagId: true,
        postedById: true,
        status: true,
        eventStartTime: true,
      },
    }),
    prisma.review.findMany({
      where: { freelancerId: { in: ids }, reviewerId: job.postedById, hiddenAt: null },
      select: { freelancerId: true, stars: true },
    }),
    prisma.jobInvite.groupBy({
      by: ["freelancerId", "status"],
      where: { freelancerId: { in: ids }, jobId: { not: job.id } },
      _count: { _all: true },
    }),
    prisma.vendorBlackout.findMany({
      where: {
        vendorId: { in: ids },
        startAt: { lt: job.breakdownTime },
        endAt: { gt: job.setupTime },
      },
      select: { vendorId: true },
    }),
  ]);

  const booked = new Set(conflicts.map((c) => c.assignedFreelancerId));
  const blackedOut = new Set(blackoutRows.map((b) => b.vendorId));
  const now = Date.now();

  return eligible
    .map((v): VendorMatch => {
      const profile = v.profile!;
      const mine = assignments.filter((a) => a.assignedFreelancerId === v.id);
      const completed = mine.filter((a) => a.status === "COMPLETED");
      const completedInCategory = completed.filter(
        (a) => a.categoryTagId === job.categoryTagId,
      ).length;
      const withPartner = completed.filter((a) => a.postedById === job.postedById).length;
      const partnerStars = partnerReviews
        .filter((r) => r.freelancerId === v.id)
        .map((r) => r.stars);

      const count = profile.ratingCount;
      const avg = profile.ratingAvg;
      const bayes =
        ((avg ?? RATING_PRIOR) * count + RATING_PRIOR * RATING_PRIOR_WEIGHT) /
        (count + RATING_PRIOR_WEIGHT);
      const quality = clamp01((bayes - 1) / 4);

      const experience = clamp01(
        (Math.log2(1 + completedInCategory) + 0.5 * Math.log2(1 + completed.length)) /
          Math.log2(1 + 10),
      );

      let partnerFit = 0.4;
      if (partnerStars.length > 0) {
        const pAvg = partnerStars.reduce((s, n) => s + n, 0) / partnerStars.length;
        partnerFit = clamp01((pAvg - 1) / 4);
      } else if (withPartner > 0) {
        partnerFit = 0.7;
      }
      if (favoriteIds.has(v.id)) {
        partnerFit = Math.max(partnerFit, 0.9);
      }

      const stat = (s: string) =>
        inviteStats.find((i) => i.freelancerId === v.id && i.status === s)?._count._all ?? 0;
      const applied = stat("APPLIED");
      const declined = stat("DECLINED");
      const pending = stat("PENDING");
      const totalInvites = applied + declined + pending + stat("WITHDRAWN");
      const responsiveness = (applied + declined + 1) / (applied + declined + pending + 2);

      const latest = mine.reduce(
        (max, a) => Math.max(max, a.eventStartTime.getTime()),
        0,
      );
      const daysIdle = latest === 0 ? 30 : Math.max(0, (now - latest) / DAY_MS);
      const rotation = clamp01(daysIdle / 30);

      const priority = v.membership?.tier === "PRO" ? 1 : 0;

      const breakdown = { quality, experience, partnerFit, responsiveness, rotation, priority };
      const score =
        100 *
        (Object.keys(WEIGHTS) as ScoreFactor[]).reduce(
          (sum, k) => sum + WEIGHTS[k] * breakdown[k],
          0,
        );

      const reasons: string[] = [];
      if (avg !== null && count > 0) {
        reasons.push(`${avg.toFixed(1)}★ across ${count} review${count === 1 ? "" : "s"}`);
      } else {
        reasons.push("New to the network — no ratings yet");
      }
      if (completedInCategory > 0) {
        reasons.push(
          `${completedInCategory} completed opportunity${completedInCategory === 1 ? "" : "s"} in this category`,
        );
      }
      if (partnerStars.length > 0 || withPartner > 0) {
        reasons.push("Has worked one of your opportunities before");
      }
      if (favoriteIds.has(v.id)) {
        reasons.push("On your My Vendors favorites");
      }
      if (totalInvites >= 2 && responsiveness >= 0.7) {
        reasons.push(`Replies to ${Math.round(responsiveness * 100)}% of invites`);
      }
      if (rotation >= 0.9) {
        reasons.push("Open calendar — no recent bookings");
      }
      if (priority) reasons.push("Pro member");
      if (blackedOut.has(v.id)) {
        reasons.push("Blocked on your calendar");
      }

      return {
        freelancerId: v.id,
        name: profile.name,
        companyName: profile.companyName,
        type: profile.type,
        headshotUrl: profile.headshotUrl,
        logoUrl: profile.logoUrl,
        ratingAvg: avg,
        ratingCount: count,
        completedInCategory,
        available: !booked.has(v.id) && !blackedOut.has(v.id),
        score: Math.round(score * 10) / 10,
        breakdown,
        reasons,
      };
    })
    .sort((a, b) => b.score - a.score);
}

/**
 * Tops the opportunity up to INVITE_TARGET open invites using the best available vendors
 * who haven't been invited yet. Returns the newly invited vendor ids.
 */
export async function topUpInvites(jobId: string, extra = 0): Promise<string[]> {
  const job = await prisma.jobOpportunity.findUnique({
    where: { id: jobId },
    include: { invites: { select: { freelancerId: true, status: true } } },
  });
  if (!job || job.status !== "ACTIVE") return [];

  const settings = await getPlatformSettings();
  const open = job.invites.filter((i) => i.status === "PENDING" || i.status === "APPLIED").length;
  const slots = Math.max(0, settings.inviteTarget - open) + extra;
  if (slots === 0) return [];

  const alreadyInvited = new Set(job.invites.map((i) => i.freelancerId));
  const picks = (await scoreVendorsForJob(job))
    .filter((m) => m.available && !alreadyInvited.has(m.freelancerId))
    .slice(0, slots);
  if (picks.length === 0) return [];

  await prisma.jobInvite.createMany({
    data: picks.map((m) => ({
      jobId: job.id,
      freelancerId: m.freelancerId,
      source: "ALGORITHM" as const,
      matchScore: m.score,
      matchReasons: m.reasons,
    })),
    skipDuplicates: true,
  });
  await prisma.notification.createMany({
    data: picks.map((m) => ({
      userId: m.freelancerId,
      type: "JOB_ALERT" as const,
      message: `You're invited to apply for "${job.title}". Apply or decline from your Invites page.`,
    })),
  });
  return picks.map((m) => m.freelancerId);
}

/** 1.0 at or under the posted rate, falling linearly to 0 at twice the rate. */
function priceFit(amount: number, payRate: number): number {
  if (payRate <= 0) return 0.5;
  if (amount <= payRate) return 1;
  return clamp01(1 - (amount - payRate) / payRate);
}

export const APPLICANT_VENDOR_WEIGHT = 0.7;
export const APPLICANT_PRICE_WEIGHT = 0.3;

/** Ranks submitted applications so partners see their strongest options first. */
export async function rankApplicants(
  job: JobWindow & {
    bids: { id: string; freelancerId: string; amount: Prisma.Decimal; notes: string | null; status: string }[];
    invites: { freelancerId: string }[];
  },
): Promise<ApplicantMatch[]> {
  const submitted = job.bids.filter((b) => b.status === "SUBMITTED");
  if (submitted.length === 0) return [];

  const matches = await scoreVendorsForJob(
    job,
    submitted.map((b) => b.freelancerId),
  );
  const invited = new Set(job.invites.map((i) => i.freelancerId));
  const payRate = Number(job.payRate);

  return submitted
    .map((bid): ApplicantMatch | null => {
      const m = matches.find((x) => x.freelancerId === bid.freelancerId);
      if (!m) return null;
      const amount = Number(bid.amount);
      const fit = priceFit(amount, payRate);
      let applicantScore =
        APPLICANT_VENDOR_WEIGHT * m.score + APPLICANT_PRICE_WEIGHT * 100 * fit;
      if (!m.available) applicantScore *= 0.5;

      const reasons = [...m.reasons];
      if (amount <= payRate) reasons.unshift("Within your posted rate");
      else reasons.unshift(`${Math.round(((amount - payRate) / payRate) * 100)}% over your posted rate`);
      if (!m.available) reasons.unshift("Now booked on an overlapping opportunity");

      return {
        ...m,
        reasons,
        bidId: bid.id,
        amount,
        notes: bid.notes,
        invited: invited.has(bid.freelancerId),
        priceFit: fit,
        applicantScore: Math.round(applicantScore * 10) / 10,
      };
    })
    .filter((x): x is ApplicantMatch => x !== null)
    .sort((a, b) => b.applicantScore - a.applicantScore);
}

export function matchReasonsFromJson(raw: unknown): string[] {
  return Array.isArray(raw) ? raw.filter((r): r is string => typeof r === "string") : [];
}
