import Link from "next/link";
import type { BidProposal, JobOpportunity, Profile, Review, Role, User } from "@/lib/generated/network-prisma/client";
import { CheckInStatus } from "@/components/network/CheckInPanel";
import { RatingStars } from "@/components/network/RatingStars";
import { ReviewForm } from "@/components/network/ReviewForm";
import { MarkVendorPaidForm } from "@/components/network/MarkVendorPaidForm";
import { Badge } from "@/components/network/ui/Badge";
import { Button } from "@/components/network/ui/Button";
import { markJobCompleted } from "@/lib/network/jobs";
import { label, reviewerTypeLabel } from "@/lib/network/labels";
import { clearVendorPaid } from "@/lib/network/partner-payment-actions";
import { isVendorReviewSubject } from "@/lib/network/review-policy";
import { formatDate, formatDateTime, formatMoney } from "@/lib/network/utils";
import { hiredPayAmount, isVendorPaid } from "@/lib/network/vendor-pay";

type ReviewWithReviewer = Review & {
  reviewer: User & { profile: Profile | null };
};

interface JobManagePanelProps {
  job: JobOpportunity & {
    reviews: ReviewWithReviewer[];
    assignedFreelancer: (User & { profile: Profile | null }) | null;
    postedBy?: User & { profile: Profile | null };
    bids?: BidProposal[];
  };
  viewerId: string;
  viewerRole: Role;
  canManage?: boolean;
}

function reviewSlotFilled(
  reviews: ReviewWithReviewer[],
  type: Review["reviewerType"],
  job?: JobManagePanelProps["job"],
): boolean {
  if (type === "CLIENT_PARTNER") {
    return reviews.some((r) => r.reviewerType === "CLIENT_PARTNER");
  }
  if (type === "INTERNAL_ADMIN") {
    return reviews.some((r) => r.reviewerType === "INTERNAL_ADMIN");
  }
  if (type === "HIRED_VENDOR") {
    return reviews.some((r) => r.reviewerType === "HIRED_VENDOR");
  }
  return false;
}

export function JobManagePanel({
  job,
  viewerId,
  viewerRole,
  canManage: canManageProp,
}: JobManagePanelProps) {
  const canManage =
    canManageProp ??
    (viewerRole === "ADMIN" || (viewerRole === "PARTNER" && job.postedById === viewerId));
  const vendorSubject =
    job.assignedFreelancer && isVendorReviewSubject(job.assignedFreelancer)
      ? job.assignedFreelancer
      : null;
  const staffAssigned = job.assignedFreelancer && !vendorSubject;

  const alreadyReviewed =
    viewerRole === "ADMIN"
      ? job.reviews.some((r) => r.reviewerId === viewerId && r.reviewerType === "INTERNAL_ADMIN")
      : viewerRole === "PARTNER"
        ? job.reviews.some((r) => r.reviewerType === "CLIENT_PARTNER")
        : job.reviews.some((r) => r.reviewerId === viewerId && r.reviewerType === "HIRED_VENDOR");

  const canReviewVendor =
    canManage &&
    viewerRole !== "FREELANCER" &&
    job.status === "COMPLETED" &&
    !!vendorSubject &&
    !alreadyReviewed;

  const canReviewPartner =
    viewerRole === "FREELANCER" &&
    job.status === "COMPLETED" &&
    job.assignedFreelancerId === viewerId &&
    job.postedBy?.role === "PARTNER" &&
    !alreadyReviewed;

  const showPanel =
    canManage ||
    canReviewPartner ||
    (viewerRole === "FREELANCER" && job.assignedFreelancerId === viewerId && job.reviews.length > 0);

  if (!showPanel) return null;

  const filledSlots =
    (reviewSlotFilled(job.reviews, "INTERNAL_ADMIN") ? 1 : 0) +
    (reviewSlotFilled(job.reviews, "CLIENT_PARTNER") ? 1 : 0) +
    (reviewSlotFilled(job.reviews, "HIRED_VENDOR") ? 1 : 0);

  return (
    <div className="space-y-8">
      {vendorSubject ? (
        <section className="border-2 border-ht-blue bg-ht-panel p-5">
          <p className="ht-label text-ht-blue-bright">Assigned vendor</p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <Link
              href={`/network/${vendorSubject.id}`}
              className="font-semibold text-ht-cream hover:text-ht-gold"
            >
              {vendorSubject.profile?.name ?? vendorSubject.email}
            </Link>
            <RatingStars
              value={vendorSubject.profile?.ratingAvg ?? null}
              count={vendorSubject.profile?.ratingCount}
            />
          </div>
          <div className="mt-3">
            <CheckInStatus job={job} />
          </div>
        </section>
      ) : staffAssigned ? (
        <section className="border-2 border-ht-line bg-ht-panel p-5 text-sm text-ht-muted">
          HiTouch staff worked this opportunity. Admin team members are not rated on the network.
        </section>
      ) : null}

      {canManage &&
      job.assignedFreelancerId &&
      (job.status === "FILLED" || job.status === "COMPLETED") ? (
        <section className="border-2 border-ht-line bg-ht-panel p-5">
          <p className="ht-label text-ht-muted">Vendor pay</p>
          {isVendorPaid(job) ? (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-ht-cream">
                  {formatMoney((job.vendorPaidAmount ?? hiredPayAmount(job)).toString())}{" "}
                  <Badge variant="gold">Paid</Badge>
                </p>
                <p className="mt-1 text-sm text-ht-muted">
                  {job.vendorPaidAt ? formatDate(job.vendorPaidAt) : ""}
                  {job.vendorPayMethod ? ` · ${label(job.vendorPayMethod)}` : ""}
                </p>
              </div>
              <form action={clearVendorPaid.bind(null, job.id)}>
                <Button type="submit" size="sm" variant="ghost">
                  Not paid
                </Button>
              </form>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              <p className="text-xl font-bold text-ht-gold">
                {formatMoney(hiredPayAmount(job))}
              </p>
              <p className="text-sm text-ht-muted">
                Pay this vendor outside HiTouch, then check them off here.
              </p>
              <MarkVendorPaidForm jobId={job.id} amount={hiredPayAmount(job)} />
            </div>
          )}
        </section>
      ) : null}

      {canManage && job.status === "FILLED" ? (
        <form action={markJobCompleted.bind(null, job.id)}>
          <Button type="submit">Mark job completed</Button>
        </form>
      ) : null}

      <section>
        <h2 className="ht-label text-ht-muted">Reviews ({filledSlots}/3)</h2>
        {job.reviews.length > 0 ? (
          <ul className="mt-3 space-y-3">
            {job.reviews.map((review) => (
              <li key={review.id} className="border-2 border-ht-line bg-ht-panel p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge
                    variant={
                      review.reviewerType === "INTERNAL_ADMIN"
                        ? "gold"
                        : review.reviewerType === "CLIENT_PARTNER"
                          ? "blue"
                          : "muted"
                    }
                  >
                    {reviewerTypeLabel(review.reviewerType)}
                  </Badge>
                  <span className="text-xs text-ht-muted">
                    {formatDateTime(review.createdAt)}
                  </span>
                </div>
                <div className="mt-2">
                  <RatingStars value={review.stars} />
                </div>
                <p className="mt-2 text-sm text-ht-cream">{review.feedback}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-ht-muted">
            {job.status === "COMPLETED"
              ? staffAssigned
                ? "No vendor reviews — HiTouch staff are not rated here."
                : "No reviews yet — HiTouch, the client, and the hired vendor can each leave one."
              : "Reviews open once the opportunity is completed."}
          </p>
        )}

        {canReviewVendor ? (
          <div className="mt-5 border-2 border-ht-gold/50 bg-ht-panel p-5">
            <p className="ht-label text-ht-gold">
              Your review ({reviewerTypeLabel(viewerRole === "ADMIN" ? "INTERNAL_ADMIN" : "CLIENT_PARTNER")})
            </p>
            <div className="mt-4">
              <ReviewForm jobId={job.id} />
            </div>
          </div>
        ) : null}

        {canReviewPartner ? (
          <div className="mt-5 border-2 border-ht-gold/50 bg-ht-panel p-5">
            <p className="ht-label text-ht-gold">
              Your review ({reviewerTypeLabel("HIRED_VENDOR")})
            </p>
            <p className="mt-1 text-sm text-ht-muted">
              Rate the partner organization — not HiTouch admin staff.
            </p>
            <div className="mt-4">
              <ReviewForm jobId={job.id} />
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
