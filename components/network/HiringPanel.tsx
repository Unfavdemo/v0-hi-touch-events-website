import Link from "next/link";
import type { ReactNode } from "react";
import type {
  BidProposal,
  JobInvite,
  JobOpportunity,
  Profile,
  User,
} from "@/lib/generated/network-prisma/client";
import {
  AvailableVendorsTip,
  InvitesTip,
  MatchScoreTip,
  RecommendationPreviewTip,
  TopPicksTip,
} from "@/components/network/help/Tips";
import { InviteVendorForm } from "@/components/network/InviteVendorForm";
import { MatchScore } from "@/components/network/MatchScore";
import { RatingStars } from "@/components/network/RatingStars";
import { VendorAvatar } from "@/components/network/VendorAvatar";
import { applicationStatusLabel, Badge, statusBadgeVariant } from "@/components/network/ui/Badge";
import { Button } from "@/components/network/ui/Button";
import { acceptBid, sendMoreInvites } from "@/lib/network/jobs";
import { INVITE_TARGET, rankApplicants, scoreVendorsForJob } from "@/lib/network/matching";
import { evaluateApplicationRequirements } from "@/lib/network/document-requirements";
import { PAPERWORK_HIRE_MESSAGE } from "@/lib/network/paperwork";
import { formatMoney } from "@/lib/network/utils";

type WithProfile = User & { profile: Profile | null };

export type HiringJob = JobOpportunity & {
  bids: (BidProposal & { freelancer: WithProfile })[];
  invites: (JobInvite & { freelancer: WithProfile })[];
};

const TOP_PICKS = 3;

function HireButton({
  bidId,
  available,
  variant = "gold",
  docsReady,
  canManage,
}: {
  bidId: string;
  available: boolean;
  variant?: "gold" | "outline";
  docsReady: boolean;
  canManage: boolean;
}) {
  if (!canManage) return null;
  if (!docsReady) {
    return (
      <p className="max-w-[12rem] text-right text-xs text-ht-muted">{PAPERWORK_HIRE_MESSAGE}</p>
    );
  }
  if (!available) {
    return (
      <p className="max-w-[12rem] text-right text-xs text-ht-muted">
        Booked during this opportunity window
      </p>
    );
  }
  return (
    <form action={acceptBid.bind(null, bidId)} className="shrink-0">
      <Button type="submit" size="sm" variant={variant}>
        Hire
      </Button>
    </form>
  );
}

export async function HiringPanel({
  job,
  canManage,
}: {
  job: HiringJob;
  canManage: boolean;
}) {
  if (job.status === "PENDING_APPROVAL") {
    const preview = (await scoreVendorsForJob(job)).filter((m) => m.available);
    return (
      <section>
        <h2 className="ht-label text-ht-muted">
          Recommended vendors (preview)
          <RecommendationPreviewTip />
        </h2>
        <p className="mt-2 text-sm text-ht-muted">
          Once HiTouch Solutions verifies this opportunity, the top {INVITE_TARGET} matches below
          are invited to apply automatically. Ranked by match score
          <MatchScoreTip />.
        </p>
        <VendorList
          items={preview.slice(0, 8).map((m) => ({
            key: m.freelancerId,
            match: m,
            score: m.score,
          }))}
          empty="No available vendors in this category yet."
        />
      </section>
    );
  }

  const bidReadiness = new Map<string, boolean>();
  for (const bid of job.bids) {
    const { ready } = await evaluateApplicationRequirements({
      vendorId: bid.freelancerId,
      profile: bid.freelancer.profile,
      jobId: job.id,
    });
    bidReadiness.set(bid.id, ready);
  }

  if (job.status !== "ACTIVE") {
    return (
      <section>
        <h2 className="ht-label text-ht-muted">Applications ({job.bids.length})</h2>
        {job.bids.length === 0 ? (
          <p className="mt-3 text-sm text-ht-muted">No applications were submitted.</p>
        ) : (
          <ul className="mt-3 divide-y-2 divide-ht-line border-2 border-ht-line bg-ht-panel">
            {job.bids.map((bid) => (
              <li key={bid.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <Link
                  href={`/network/${bid.freelancerId}`}
                  className="font-semibold text-ht-cream hover:text-ht-gold"
                >
                  {bid.freelancer.profile?.name ?? bid.freelancer.email}
                </Link>
                <span className="flex items-center gap-3">
                  <span className="font-semibold text-ht-gold">
                    {formatMoney(bid.amount.toString())}
                  </span>
                  <Badge variant={statusBadgeVariant(bid.status)}>
                    {applicationStatusLabel(bid.status)}
                  </Badge>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  const [applicants, pool] = await Promise.all([
    rankApplicants(job),
    scoreVendorsForJob(job),
  ]);
  const invitedIds = new Set(job.invites.map((i) => i.freelancerId));
  const appliedIds = new Set(job.bids.map((b) => b.freelancerId));
  const recommendations = pool.filter(
    (m) => m.available && !invitedIds.has(m.freelancerId) && !appliedIds.has(m.freelancerId),
  );
  const bookedCount = pool.filter((m) => !m.available).length;
  const topPicks = applicants.slice(0, TOP_PICKS);
  const otherApplicants = applicants.slice(TOP_PICKS);

  return (
    <div className="space-y-10">
      <section>
        <h2 className="ht-label text-ht-muted">
          Top picks from applicants ({applicants.length} applied)
          <TopPicksTip />
        </h2>
        <p className="mt-2 text-sm text-ht-muted">
          Ranked by rating, category experience, history with you, reliability, and how the
          quote compares to your posted rate. You make the final call.
        </p>
        {topPicks.length === 0 ? (
          <p className="mt-4 border-2 border-ht-line bg-ht-panel px-5 py-6 text-sm text-ht-muted">
            No applications yet. Invited vendors are notified and can apply any time before
            you hire.
          </p>
        ) : (
          <ol className="mt-4 space-y-3">
            {topPicks.map((a, i) => (
              <li
                key={a.bidId}
                className={
                  i === 0
                    ? "border-2 border-ht-blue bg-ht-panel p-5"
                    : "border-2 border-ht-line bg-ht-panel p-5"
                }
              >
                <div className="flex flex-wrap items-start gap-4">
                  <VendorAvatar
                    name={a.name}
                    type={a.type}
                    headshotUrl={a.headshotUrl}
                    logoUrl={a.logoUrl}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={i === 0 ? "gold" : "blue"}>
                        {i === 0 ? "Best match" : `Pick #${i + 1}`}
                      </Badge>
                      {a.invited ? <Badge variant="muted">Invited</Badge> : null}
                    </div>
                    <Link
                      href={`/network/${a.freelancerId}`}
                      className="mt-1 block text-lg font-semibold text-ht-cream hover:text-ht-gold"
                    >
                      {a.name}
                    </Link>
                    <RatingStars value={a.ratingAvg} count={a.ratingCount} />
                    <ul className="mt-2 space-y-0.5 text-sm text-ht-muted">
                      {a.reasons.slice(0, 4).map((r) => (
                        <li key={r}>· {r}</li>
                      ))}
                    </ul>
                    {a.notes ? (
                      <p className="mt-3 border-l-2 border-ht-line pl-3 text-sm text-ht-cream">
                        {a.notes}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <MatchScore value={a.applicantScore} label="fit" />
                    <p className="text-lg font-bold text-ht-cream">{formatMoney(a.amount)}</p>
                    {canManage ? (
                      <HireButton
                        bidId={a.bidId}
                        available={a.available}
                        docsReady={bidReadiness.get(a.bidId) ?? false}
                        canManage={canManage}
                      />
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
        {otherApplicants.length > 0 ? (
          <ul className="mt-3 divide-y-2 divide-ht-line border-2 border-ht-line bg-ht-panel">
            {otherApplicants.map((a) => (
              <li key={a.bidId} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <Link
                    href={`/network/${a.freelancerId}`}
                    className="font-semibold text-ht-cream hover:text-ht-gold"
                  >
                    {a.name}
                  </Link>
                  <p className="text-sm text-ht-muted">{a.reasons[0]}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-ht-cream">{formatMoney(a.amount)}</span>
                  <MatchScore value={a.applicantScore} label="fit" />
                  {canManage ? (
                    <HireButton
                      bidId={a.bidId}
                      available={a.available}
                      variant="outline"
                      docsReady={bidReadiness.get(a.bidId) ?? false}
                      canManage={canManage}
                    />
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section>
        <h2 className="ht-label text-ht-muted">
          Invited vendors ({job.invites.length})
          <InvitesTip />
        </h2>
        {job.invites.length === 0 ? (
          <p className="mt-3 text-sm text-ht-muted">
            No invites yet — nobody available matches this category right now.
          </p>
        ) : (
          <ul className="mt-3 divide-y-2 divide-ht-line border-2 border-ht-line bg-ht-panel">
            {[...job.invites]
              .sort((a, b) => b.matchScore - a.matchScore)
              .map((inv) => (
                <li
                  key={inv.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/network/${inv.freelancerId}`}
                      className="font-semibold text-ht-cream hover:text-ht-gold"
                    >
                      {inv.freelancer.profile?.name ?? inv.freelancer.email}
                    </Link>
                    <Badge variant="muted">
                      {inv.source === "PARTNER" ? "Hand-picked" : "Recommended"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-ht-muted">
                      {Math.round(inv.matchScore)} match
                    </span>
                    <Badge variant={inviteBadge(inv.status)}>{inviteLabel(inv.status)}</Badge>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </section>

      {canManage ? (
        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="ht-label text-ht-muted">
                More available vendors ({recommendations.length})
                <AvailableVendorsTip />
              </h2>
              <p className="mt-2 text-sm text-ht-muted">
                Free during your setup-to-breakdown window, ranked by match score
                <MatchScoreTip />.
                {bookedCount > 0
                  ? ` ${bookedCount} other vendor${bookedCount === 1 ? " is" : "s are"} booked at that time.`
                  : ""}
              </p>
            </div>
            {recommendations.length > 0 ? (
              <form action={sendMoreInvites.bind(null, job.id)} className="shrink-0">
                <Button type="submit" size="sm" variant="outline">
                  Invite next 3 best matches
                </Button>
              </form>
            ) : null}
          </div>
          <VendorList
            items={recommendations.map((m) => ({
              key: m.freelancerId,
              match: m,
              score: m.score,
              action: <InviteVendorForm freelancerId={m.freelancerId} jobId={job.id} />,
            }))}
            empty="Every available match has already been invited."
          />
        </section>
      ) : null}
    </div>
  );
}

function VendorList({
  items,
  empty,
}: {
  items: {
    key: string;
    score: number;
    match: Awaited<ReturnType<typeof scoreVendorsForJob>>[number];
    action?: ReactNode;
  }[];
  empty: string;
}) {
  if (items.length === 0) {
    return <p className="mt-4 text-sm text-ht-muted">{empty}</p>;
  }
  return (
    <ul className="mt-4 space-y-3">
      {items.map(({ key, match: m, score, action }) => (
        <li key={key} className="flex flex-wrap items-start gap-4 border-2 border-ht-line bg-ht-panel p-4">
          <VendorAvatar
            name={m.name}
            type={m.type}
            headshotUrl={m.headshotUrl}
            logoUrl={m.logoUrl}
            size="md"
            className="h-14 w-14 text-lg"
          />
          <div className="min-w-0 flex-1">
            <Link
              href={`/network/${m.freelancerId}`}
              className="font-semibold text-ht-cream hover:text-ht-gold"
            >
              {m.name}
            </Link>
            {m.companyName ? <p className="text-sm text-ht-muted">{m.companyName}</p> : null}
            <p className="mt-1 text-sm text-ht-muted">{m.reasons.slice(0, 3).join(" · ")}</p>
          </div>
          <div className="flex w-full min-w-[12rem] flex-col items-stretch gap-2 sm:w-52 sm:shrink-0">
            <MatchScore value={score} />
            {action}
          </div>
        </li>
      ))}
    </ul>
  );
}

function inviteLabel(status: JobInvite["status"]): string {
  switch (status) {
    case "PENDING":
      return "Awaiting reply";
    case "APPLIED":
      return "Applied";
    case "DECLINED":
      return "Declined";
    case "WITHDRAWN":
      return "Closed";
  }
}

function inviteBadge(status: JobInvite["status"]) {
  switch (status) {
    case "APPLIED":
      return "gold" as const;
    case "DECLINED":
      return "danger" as const;
    default:
      return "muted" as const;
  }
}
