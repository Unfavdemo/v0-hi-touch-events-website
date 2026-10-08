import Link from "next/link";
import { AdminHeader } from "@/components/network/admin/AdminHeader";
import { requireSuperAdmin } from "@/lib/network/admin-rbac";
import { prisma } from "@/lib/network/prisma";

export default async function AdminMatchingPage() {
  await requireSuperAdmin();
  const jobs = await prisma.jobOpportunity.findMany({
    where: { status: { in: ["ACTIVE", "FILLED", "COMPLETED"] } },
    include: {
      categoryTag: true,
      invites: true,
      bids: true,
    },
    orderBy: { eventStartTime: "desc" },
    take: 40,
  });

  const vendors = await prisma.user.findMany({
    where: { role: "FREELANCER", status: "APPROVED" },
    include: {
      profile: true,
      jobInvites: { select: { status: true, respondedAt: true } },
    },
  });

  const ignoring = vendors
    .map((v) => {
      const pending = v.jobInvites.filter((i) => i.status === "PENDING").length;
      const total = v.jobInvites.length;
      return { v, pending, total };
    })
    .filter((row) => row.pending >= 2)
    .sort((a, b) => b.pending - a.pending)
    .slice(0, 12);

  return (
    <div className="space-y-10">
      <AdminHeader title="Matching">
        Invite acceptance, time to first applicant, and opportunities still short on candidates.
      </AdminHeader>

      <section>
        <h2 className="ht-label text-ht-muted">Recent opportunities</h2>
        <div className="mt-4 overflow-x-auto border-2 border-ht-line">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b-2 border-ht-line bg-ht-panel">
              <tr>
                <th className="ht-label px-4 py-3 text-ht-muted">Opportunity</th>
                <th className="ht-label px-4 py-3 text-ht-muted">Invited</th>
                <th className="ht-label px-4 py-3 text-ht-muted">Applied</th>
                <th className="ht-label px-4 py-3 text-ht-muted">Declined</th>
                <th className="ht-label px-4 py-3 text-ht-muted">First applicant</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => {
                const applied = job.invites.filter((i) => i.status === "APPLIED").length;
                const declined = job.invites.filter((i) => i.status === "DECLINED").length;
                const firstBid = job.bids
                  .map((b) => b.createdAt.getTime())
                  .sort((a, b) => a - b)[0];
                const hours =
                  firstBid != null
                    ? Math.round((firstBid - job.createdAt.getTime()) / 36e5)
                    : null;
                return (
                  <tr key={job.id} className="border-b border-ht-line last:border-b-0">
                    <td className="px-4 py-3">
                      <Link href={`/network/admin/jobs/${job.id}`} className="text-ht-cream hover:text-ht-gold">
                        {job.title}
                      </Link>
                      <p className="text-xs text-ht-muted">{job.categoryTag.name}</p>
                    </td>
                    <td className="px-4 py-3 text-ht-muted">{job.invites.length}</td>
                    <td className="px-4 py-3 text-ht-muted">{applied}</td>
                    <td className="px-4 py-3 text-ht-muted">{declined}</td>
                    <td className="px-4 py-3 text-ht-muted">
                      {hours == null ? "—" : hours <= 0 ? "under an hour" : `${hours}h`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="ht-label text-ht-muted">Vendors sitting on invites</h2>
        {ignoring.length === 0 ? (
          <p className="mt-3 text-sm text-ht-muted">Nobody is holding multiple open invites.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {ignoring.map(({ v, pending, total }) => (
              <li key={v.id}>
                <Link href={`/network/admin/members/${v.id}`} className="text-ht-cream hover:text-ht-gold">
                  {v.profile?.name ?? v.email}
                </Link>
                <span className="text-ht-muted">
                  {" "}
                  · {pending} open of {total} invites
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
