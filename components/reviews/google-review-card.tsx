import { StarRating } from "@/components/reviews/star-rating"
import { formatReviewAge, reviewerInitials, type PublicVendorReview } from "@/lib/reviews/vendor-review"

export function GoogleReviewCard({ review }: { review: PublicVendorReview }) {
  const when = review.eventDate ?? review.createdAt
  const context = [review.projectName, review.clientName].filter(Boolean).join(" · ")

  return (
    <article className="rounded-xl border border-border bg-card/40 p-4 shadow-sm">
      <div className="flex gap-3">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand/15 font-display text-sm font-medium text-brand-ink"
          aria-hidden
        >
          {reviewerInitials(review.reviewerName)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="font-medium text-foreground">{review.reviewerName}</p>
            <time className="text-xs text-muted-foreground" dateTime={review.createdAt.toISOString()}>
              {formatReviewAge(review.createdAt)}
            </time>
          </div>
          <StarRating rating={review.rating} className="mt-1.5" />
          {review.headline ? <p className="mt-2 font-medium text-foreground">{review.headline}</p> : null}
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{review.body}</p>
          {context || when ? (
            <p className="mt-3 text-xs text-muted-foreground">
              {context}
              {context && when ? " · " : ""}
              {when ? when.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : ""}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  )
}
