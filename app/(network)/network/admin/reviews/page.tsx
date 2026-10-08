import Link from "next/link";
import { AdminHeader } from "@/components/network/admin/AdminHeader";
import { RatingStars } from "@/components/network/RatingStars";
import { Badge } from "@/components/network/ui/Badge";
import { Button } from "@/components/network/ui/Button";
import { clearDismissalFlag, suspendUser } from "@/lib/network/admin-actions";
import { adminJobsWhere, isSuperAdmin } from "@/lib/network/admin-rbac";
import { requireUser } from "@/lib/network/auth";
import { label } from "@/lib/network/labels";
import { prisma } from "@/lib/network/prisma";
import { setReviewHidden } from "@/lib/network/review-moderation";
import { formatDate } from "@/lib/network/utils";

export default async function AdminReviewsPage() {
  const admin = await requireUser("ADMIN");
  const superAdmin = isSuperAdmin(admin);

  const [reviews, flagged] = await Promise.all([
    prisma.review.findMany({
      where: superAdmin ? {} : { job: adminJobsWhere(admin) },
      include: {
        job: true,
        freelancer: { include: { profile: true } },
        reviewer: { include: { profile: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 80,
    }),
    superAdmin
      ? prisma.profile.findMany({
          where: { flaggedForDismissal: true },
          include: { user: true },
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-10">
      <AdminHeader title="Reviews">
        Hide a review if it should not count toward a vendor&apos;s average. Hidden reviews stay
        on file.
      </AdminHeader>

      {superAdmin ? (
        <section>
          <h2 className="ht-label text-ht-danger">Vendors with low ratings</h2>
          {flagged.length === 0 ? (
            <p className="mt-4 text-sm text-ht-muted">Every vendor is in good standing.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {flagged.map((p) => (
                <li key={p.id} className="border-2 border-ht-danger/50 bg-ht-panel p-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <Link
                        href={`/network/admin/members/${p.userId}`}
                        className="font-semibold text-ht-cream hover:text-ht-gold"
                      >
                        {p.name}
                      </Link>
                      <div className="mt-1">
                        <RatingStars value={p.ratingAvg} count={p.ratingCount} />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {p.user.status !== "SUSPENDED" ? (
                        <form action={suspendUser.bind(null, p.userId)}>
                          <Button type="submit" size="sm" variant="danger">
                            Suspend
                          </Button>
                        </form>
                      ) : null}
                      <form action={clearDismissalFlag.bind(null, p.userId)}>
                        <Button type="submit" size="sm" variant="outline">
                          Clear flag
                        </Button>
                      </form>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      <section>
        <h2 className="ht-label text-ht-muted">All reviews</h2>
        {reviews.length === 0 ? (
          <p className="mt-4 border-2 border-dashed border-ht-line px-5 py-8 text-center text-sm text-ht-muted">
            No reviews yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {reviews.map((r) => (
              <li key={r.id} className="border-2 border-ht-line bg-ht-panel p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ht-cream">
                      {r.freelancer.profile?.name ?? r.freelancer.email}
                      {r.hiddenAt ? (
                        <Badge variant="muted" className="ml-2">
                          Hidden
                        </Badge>
                      ) : null}
                    </p>
                    <p className="mt-1 text-sm text-ht-muted">
                      {r.stars}★ · {label(r.reviewerType)} · {r.job.title} ·{" "}
                      {formatDate(r.createdAt)}
                    </p>
                    <p className="mt-2 text-sm text-ht-cream">{r.feedback}</p>
                  </div>
                  <form action={setReviewHidden.bind(null, r.id, !r.hiddenAt)}>
                    <Button type="submit" size="sm" variant="outline">
                      {r.hiddenAt ? "Restore" : "Hide"}
                    </Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
