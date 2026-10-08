import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/network/admin/AdminHeader";
import { RatingStars } from "@/components/network/RatingStars";
import { Badge, eventStatusLabel, statusBadgeVariant } from "@/components/network/ui/Badge";
import { Button } from "@/components/network/ui/Button";
import { Textarea } from "@/components/network/ui/Textarea";
import { saveMemberNotes } from "@/lib/network/admin-actions";
import { requireSuperAdmin } from "@/lib/network/admin-rbac";
import { documentKindLabel } from "@/lib/network/document-access";
import { label } from "@/lib/network/labels";
import { prisma } from "@/lib/network/prisma";
import { formatDate, formatMoney } from "@/lib/network/utils";
import { hiredPayAmount, isVendorPaid } from "@/lib/network/vendor-pay";

export default async function AdminMemberDossierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSuperAdmin();
  const { id } = await params;
  const member = await prisma.user.findUnique({
    where: { id },
    include: {
      profile: { include: { categoryTags: true } },
      membership: true,
      vendorDocuments: { orderBy: { createdAt: "desc" } },
      notifications: { orderBy: { createdAt: "desc" }, take: 12 },
      reviewsReceived: {
        include: { job: true, reviewer: { include: { profile: true } } },
        orderBy: { createdAt: "desc" },
      },
      incidentsReceived: {
        include: { job: true, reporter: { include: { profile: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      bids: { include: { job: true }, orderBy: { createdAt: "desc" }, take: 12 },
      jobInvites: { include: { job: true }, orderBy: { createdAt: "desc" }, take: 12 },
      jobsPosted: { include: { categoryTag: true }, orderBy: { eventStartTime: "desc" }, take: 12 },
      jobsAssigned: {
        include: { categoryTag: true, bids: { where: { status: "ACCEPTED" } } },
        orderBy: { eventStartTime: "desc" },
        take: 12,
      },
    },
  });
  if (!member || member.role === "ADMIN") notFound();

  const name = member.profile?.name ?? member.email;
  const back = member.role === "PARTNER" ? "/admin/partners" : "/admin/vendors";

  return (
    <div className="space-y-10">
      <Link href={back} className="ht-label text-ht-muted hover:text-ht-gold">
        ← {member.role === "PARTNER" ? "Partners" : "Vendors"}
      </Link>

      <AdminHeader title={name}>
        Private dossier — applications, jobs, documents, payments, and reviews. Notes below
        are visible only to super admins.
        <span className="mt-2 block text-ht-cream">
          {member.email}
          {member.profile?.companyName ? ` · ${member.profile.companyName}` : ""}
        </span>
      </AdminHeader>
      <div className="flex flex-wrap gap-2">
          <Badge variant={member.role === "PARTNER" ? "blue" : "gold"}>{label(member.role)}</Badge>
          <Badge variant={statusBadgeVariant(member.status)}>{label(member.status)}</Badge>
          {member.membership ? (
            <Badge variant="muted">
              {label(member.membership.tier)} · {label(member.membership.status)}
            </Badge>
          ) : null}
        </div>

      <section className="border-2 border-ht-line bg-ht-panel p-5">
        <h2 className="ht-label text-ht-muted">Private notes</h2>
        <form action={saveMemberNotes.bind(null, member.id)} className="mt-3 space-y-3">
          <Textarea
            name="adminNotes"
            defaultValue={member.profile?.adminNotes ?? ""}
            rows={4}
            placeholder="Only HiTouch admins see this."
          />
          <Button type="submit" size="sm">
            Save notes
          </Button>
        </form>
      </section>

      {member.role === "FREELANCER" ? (
        <>
          <section>
            <h2 className="ht-label text-ht-muted">Skills</h2>
            <p className="mt-2 flex flex-wrap gap-1.5">
              {member.profile?.categoryTags.map((t) => (
                <Badge key={t.id} variant="blue">
                  {t.name}
                </Badge>
              ))}
            </p>
            <div className="mt-3">
              <RatingStars
                value={member.profile?.ratingAvg ?? null}
                count={member.profile?.ratingCount}
              />
            </div>
          </section>

          <section>
            <h2 className="ht-label text-ht-muted">Documents</h2>
            <Link
              href={`/network/admin/documents/${member.id}`}
              className="mt-2 inline-block ht-label text-ht-gold hover:text-ht-gold-bright"
            >
              Open document library →
            </Link>
            <ul className="mt-3 text-sm text-ht-muted">
              {member.vendorDocuments.map((d) => (
                <li key={d.id}>
                  {documentKindLabel(d.kind)} — {d.label}
                  {d.expiresAt ? ` · expires ${formatDate(d.expiresAt)}` : ""}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="ht-label text-ht-muted">Hired opportunities</h2>
            {member.jobsAssigned.length === 0 ? (
              <p className="mt-2 text-sm text-ht-muted">None yet.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {member.jobsAssigned.map((job) => (
                  <li key={job.id} className="text-sm">
                    <Link href={`/network/admin/jobs/${job.id}`} className="text-ht-cream hover:text-ht-gold">
                      {job.title}
                    </Link>
                    <span className="text-ht-muted">
                      {" "}
                      · {formatMoney(hiredPayAmount(job))}
                      {isVendorPaid(job) ? " · paid" : " · unpaid"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="ht-label text-ht-muted">Incidents</h2>
            {member.incidentsReceived.length === 0 ? (
              <p className="mt-2 text-sm text-ht-muted">None logged.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {member.incidentsReceived.map((inc) => (
                  <li key={inc.id} className="border-2 border-ht-line bg-ht-panel p-4 text-sm">
                    <p className="text-ht-cream">
                      {label(inc.kind)}
                      {inc.voidedAt ? " · undone" : ""}
                      {inc.job ? ` · ${inc.job.title}` : ""}
                    </p>
                    <p className="mt-1 text-ht-muted">{inc.notes}</p>
                    <p className="mt-1 text-xs text-ht-muted">{formatDate(inc.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="ht-label text-ht-muted">Reviews</h2>
            <ul className="mt-3 space-y-3">
              {member.reviewsReceived.map((r) => (
                <li key={r.id} className="border-2 border-ht-line bg-ht-panel p-4 text-sm">
                  <p className="text-ht-cream">
                    {r.stars}★ · {r.job.title}
                    {r.hiddenAt ? " · hidden" : ""}
                  </p>
                  <p className="mt-1 text-ht-muted">{r.feedback}</p>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : (
        <section>
          <h2 className="ht-label text-ht-muted">Posted opportunities</h2>
          <ul className="mt-3 space-y-2">
            {member.jobsPosted.map((job) => (
              <li key={job.id} className="text-sm">
                <Link href={`/network/admin/jobs/${job.id}`} className="text-ht-cream hover:text-ht-gold">
                  {job.title}
                </Link>
                <span className="text-ht-muted"> · {eventStatusLabel(job.status)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="ht-label text-ht-muted">Recent notifications</h2>
        {member.notifications.length === 0 ? (
          <p className="mt-2 text-sm text-ht-muted">None sent yet.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm text-ht-muted">
            {member.notifications.map((n) => (
              <li key={n.id}>
                {formatDate(n.createdAt)} · {label(n.type)} — {n.message}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
