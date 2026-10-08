import Link from "next/link";
import { ReviewForm } from "@/components/network/ReviewForm";
import { RatingStars } from "@/components/network/RatingStars";
import { VendorAvatar } from "@/components/network/VendorAvatar";
import { requirePartnerOrg } from "@/lib/network/partner-org";
import { prisma } from "@/lib/network/prisma";
import { formatDate } from "@/lib/network/utils";

export default async function PartnerReviewsPage() {
  const { ownerId } = await requirePartnerOrg();
  const jobs = await prisma.jobOpportunity.findMany({
    where: {
      postedById: ownerId,
      status: "COMPLETED",
      assignedFreelancerId: { not: null },
    },
    include: {
      categoryTag: true,
      assignedFreelancer: { include: { profile: true } },
      reviews: { where: { reviewerType: "CLIENT_PARTNER" } },
    },
    orderBy: { eventStartTime: "desc" },
  });

  const pending = jobs.filter((j) => j.reviews.length === 0);
  const done = jobs.filter((j) => j.reviews.length > 0);

  return (
    <div className="space-y-10">
      <header>
        <p className="ht-label text-ht-blue-bright">Partner</p>
        <h1 className="mt-1 text-3xl font-bold text-ht-cream">Reviews</h1>
        <p className="mt-2 max-w-2xl text-sm text-ht-muted">
          After an opportunity is marked completed, rate the vendor you hired. Your reviews are
          the biggest signal in who we invite next time.
        </p>
      </header>

      <section>
        <h2 className="ht-label text-ht-muted">Need a review ({pending.length})</h2>
        {pending.length === 0 ? (
          <p className="mt-4 border-2 border-ht-line bg-ht-panel px-5 py-8 text-center text-sm text-ht-muted">
            Nothing waiting. Reviews show up here once an opportunity is marked completed.
          </p>
        ) : (
          <ul className="mt-4 space-y-6">
            {pending.map((job) => {
              const vendor = job.assignedFreelancer!;
              const profile = vendor.profile;
              return (
                <li key={job.id} className="border-2 border-ht-gold/50 bg-ht-panel p-5">
                  <div className="flex flex-wrap items-start gap-4">
                    <VendorAvatar
                      name={profile?.name ?? vendor.email}
                      type={profile?.type ?? "INDIVIDUAL"}
                      headshotUrl={profile?.headshotUrl}
                      logoUrl={profile?.logoUrl}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/network/partner/jobs/${job.id}`}
                        className="font-semibold text-ht-cream hover:text-ht-gold"
                      >
                        {job.title}
                      </Link>
                      <p className="mt-1 text-sm text-ht-muted">
                        <Link href={`/network/${vendor.id}`} className="hover:text-ht-gold">
                          {profile?.name ?? vendor.email}
                        </Link>
                        {" · "}
                        {job.categoryTag.name}
                        {" · "}
                        {formatDate(job.eventStartTime)}
                      </p>
                      <div className="mt-5">
                        <ReviewForm jobId={job.id} />
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="ht-label text-ht-muted">Your reviews ({done.length})</h2>
        {done.length === 0 ? (
          <p className="mt-4 text-sm text-ht-muted">You haven&apos;t left a review yet.</p>
        ) : (
          <ul className="mt-4 divide-y-2 divide-ht-line border-2 border-ht-line bg-ht-panel">
            {done.map((job) => {
              const review = job.reviews[0];
              const vendor = job.assignedFreelancer!;
              return (
                <li key={job.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Link
                        href={`/network/partner/jobs/${job.id}`}
                        className="font-semibold text-ht-cream hover:text-ht-gold"
                      >
                        {job.title}
                      </Link>
                      <p className="mt-1 text-sm text-ht-muted">
                        {vendor.profile?.name ?? vendor.email}
                        {" · "}
                        {formatDate(job.eventStartTime)}
                      </p>
                    </div>
                    <RatingStars value={review.stars} />
                  </div>
                  <p className="mt-2 text-sm text-ht-cream">{review.feedback}</p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
