import { AdminHeader } from "@/components/network/admin/AdminHeader";
import { Badge } from "@/components/network/ui/Badge";
import { Button } from "@/components/network/ui/Button";
import { approveUser, rejectUser } from "@/lib/network/admin-actions";
import { requireSuperAdmin } from "@/lib/network/admin-rbac";
import { label } from "@/lib/network/labels";
import { paperworkLabel, vendorPaperworkComplete } from "@/lib/network/paperwork";
import { prisma } from "@/lib/network/prisma";
import { formatDate } from "@/lib/network/utils";

export default async function AdminApplicationsPage() {
  await requireSuperAdmin();
  const pendingUsers = await prisma.user.findMany({
    where: { status: "PENDING", role: { not: "ADMIN" } },
    include: { profile: { include: { categoryTags: true } }, membership: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-8">
      <AdminHeader title="Applications">
        People waiting to join the network. Confirm vendor paperwork before you approve.
      </AdminHeader>

      {pendingUsers.length === 0 ? (
        <p className="border-2 border-dashed border-ht-line px-5 py-8 text-center text-sm text-ht-muted">
          No one is waiting to join right now.
        </p>
      ) : (
        <ul className="space-y-3">
          {pendingUsers.map((u) => (
            <li key={u.id} className="border-2 border-ht-line bg-ht-panel p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-ht-cream">
                      {u.profile?.name ?? u.email}
                    </span>
                    <Badge variant={u.role === "PARTNER" ? "blue" : "gold"}>
                      {label(u.role)}
                    </Badge>
                    {u.profile?.type ? (
                      <Badge variant="muted">{label(u.profile.type)}</Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-ht-muted">
                    {u.email}
                    {u.profile?.companyName ? ` · ${u.profile.companyName}` : ""}
                    {" · applied "}
                    {formatDate(u.createdAt)}
                  </p>
                  {u.profile?.phone || u.profile?.mailingAddress ? (
                    <p className="mt-1 text-sm text-ht-muted">
                      {u.profile.phone ? `Call or text ${u.profile.phone}` : ""}
                      {u.profile.phone && u.profile.mailingAddress ? " · " : ""}
                      {u.profile.mailingAddress ?? ""}
                    </p>
                  ) : null}
                  {u.profile && u.profile.categoryTags.length > 0 ? (
                    <p className="mt-2 flex flex-wrap gap-1.5">
                      {u.profile.categoryTags.map((t) => (
                        <Badge key={t.id} variant="blue">
                          {t.name}
                        </Badge>
                      ))}
                    </p>
                  ) : null}
                  {u.membership ? (
                    <p className="mt-2 text-xs text-ht-muted">
                      Membership: {label(u.membership.tier)} plan · {label(u.membership.status)}
                    </p>
                  ) : null}
                  {u.role === "FREELANCER" ? (
                    <p className="mt-2 text-xs text-ht-muted">
                      Paperwork: {paperworkLabel(u.profile)}
                      {u.profile?.w9Url ? (
                        <>
                          {" · "}
                          <a
                            href={`/api/vendor-w9/${u.id}`}
                            className="text-ht-gold hover:text-ht-gold-bright"
                            target="_blank"
                            rel="noreferrer"
                          >
                            View W-9
                          </a>
                        </>
                      ) : null}
                      {vendorPaperworkComplete(u.profile) ? null : (
                        <span className="text-ht-danger">
                          {" "}
                          — finish this before they can take opportunities
                        </span>
                      )}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <form action={approveUser.bind(null, u.id)}>
                    <Button type="submit" size="sm">
                      Approve
                    </Button>
                  </form>
                  <form action={rejectUser.bind(null, u.id)}>
                    <Button type="submit" size="sm" variant="danger">
                      Reject
                    </Button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
