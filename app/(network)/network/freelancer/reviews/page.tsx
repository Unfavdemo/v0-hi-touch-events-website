import Link from "next/link";
import { RatingStars } from "@/components/network/RatingStars";
import { Badge } from "@/components/network/ui/Badge";
import { VendorHeader } from "@/components/network/freelancer/VendorHeader";
import { VendorReviewsTip } from "@/components/network/help/Tips";
import { requireUser } from "@/lib/network/auth";
import { getPlatformSettings } from "@/lib/network/platform-settings";
import { prisma } from "@/lib/network/prisma";
import { getRatingSummary } from "@/lib/network/ratings";
import { formatDate } from "@/lib/network/utils";

export default async function FreelancerReviewsPage() {
  const user = await requireUser("FREELANCER");
  const [summary, settings, reviews, awaitingJobs] = await Promise.all([
    getRatingSummary(user.id),
    getPlatformSettings(),
    prisma.review.findMany({
      where: { freelancerId: user.id, hiddenAt: null },
      include: {
        job: { include: { categoryTag: true } },
        reviewer: { include: { profile: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.jobOpportunity.findMany({
      where: {
        assignedFreelancerId: user.id,
        status: "COMPLETED",
        reviews: { none: {} },
      },
      include: { categoryTag: true },
      orderBy: { eventEndTime: "desc" },
      take: 12,
    }),
  ]);

  const hitouch = reviews.filter((r) => r.reviewerType === "INTERNAL_ADMIN");
  const clients = reviews.filter((r) => r.reviewerType === "CLIENT_PARTNER");
  const avg = summary.overall.avg;

  return (
    <div className="space-y-10">
      <VendorHeader title="Reviews" tip={<VendorReviewsTip />}>
        Every star from HiTouch and from clients feeds matching. Moderated (hidden) reviews
        drop out of your average but stay visible to admins.
      </VendorHeader>

      <section className="grid gap-5 md:grid-cols-3">
        <div className="border-2 border-ht-line bg-ht-panel p-5">
          <h2 className="ht-label text-ht-muted">Overall</h2>
          <div className="mt-3">
            <RatingStars value={avg} count={summary.overall.count} />
          </div>
        </div>
        <div className="border-2 border-ht-line bg-ht-panel p-5">
          <h2 className="ht-label text-ht-muted">From HiTouch</h2>
          <p className="mt-3 text-xl font-bold text-ht-cream">
            {summary.byType.INTERNAL_ADMIN.avg?.toFixed(2) ?? "—"}{" "}
            <span className="text-sm font-normal text-ht-muted">
              ({summary.byType.INTERNAL_ADMIN.count})
            </span>
          </p>
        </div>
        <div className="border-2 border-ht-line bg-ht-panel p-5">
          <h2 className="ht-label text-ht-muted">From clients</h2>
          <p className="mt-3 text-xl font-bold text-ht-cream">
            {summary.byType.CLIENT_PARTNER.avg?.toFixed(2) ?? "—"}{" "}
            <span className="text-sm font-normal text-ht-muted">
              ({summary.byType.CLIENT_PARTNER.count})
            </span>
          </p>
        </div>
      </section>

      {avg !== null && avg < settings.dismissalThreshold ? (
        <p className="border-2 border-ht-danger bg-ht-panel px-5 py-4 text-sm text-ht-danger">
          Your average is below {settings.dismissalThreshold.toFixed(1)}. The HiTouch team may
          review your membership.
        </p>
      ) : avg !== null && avg < settings.warningThreshold ? (
        <p className="border-2 border-ht-gold bg-ht-panel px-5 py-4 text-sm text-ht-gold">
          Your average is below {settings.warningThreshold.toFixed(1)}. Strong reviews on upcoming
          opportunities help protect your spot in the network.
        </p>
      ) : null}

      {awaitingJobs.length > 0 ? (
        <section>
          <h2 className="ht-label text-ht-muted">Awaiting feedback ({awaitingJobs.length})</h2>
          <p className="mt-2 text-sm text-ht-muted">
            Completed opportunities where neither HiTouch nor the client has posted a review yet.
          </p>
          <ul className="mt-4 divide-y-2 divide-ht-line border-2 border-ht-line bg-ht-panel">
            {awaitingJobs.map((job) => (
              <li key={job.id} className="px-5 py-4">
                <Link href={`/network/freelancer/jobs/${job.id}`} className="font-semibold text-ht-cream hover:text-ht-gold">
                  {job.title}
                </Link>
                <p className="mt-1 text-sm text-ht-muted">
                  {job.categoryTag.name} · ended {formatDate(job.eventEndTime)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <ReviewSection title="HiTouch reviews" items={hitouch} />
      <ReviewSection title="Client reviews" items={clients} />
    </div>
  );
}

function ReviewSection({
  title,
  items,
}: {
  title: string;
  items: {
    id: string;
    stars: number;
    feedback: string;
    createdAt: Date;
    job: { title: string; id: string };
    reviewer: { profile: { name: string } | null };
  }[];
}) {
  return (
    <section>
      <h2 className="ht-label text-ht-muted">
        {title} ({items.length})
      </h2>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-ht-muted">None yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((r) => (
            <li key={r.id} className="border-2 border-ht-line bg-ht-panel p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link href={`/network/freelancer/jobs/${r.job.id}`} className="font-semibold text-ht-cream hover:text-ht-gold">
                  {r.job.title}
                </Link>
                <Badge variant="gold">{r.stars}★</Badge>
              </div>
              <p className="mt-2 text-sm text-ht-cream">{r.feedback}</p>
              <p className="mt-2 text-xs text-ht-muted">
                {r.reviewer.profile?.name ?? "Reviewer"} · {formatDate(r.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
