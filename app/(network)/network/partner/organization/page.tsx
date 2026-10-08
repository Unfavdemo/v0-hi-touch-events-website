import { AddCoordinatorForm } from "@/components/network/AddCoordinatorForm";
import { PartnerDocumentRequirementsManager } from "@/components/network/partner/PartnerDocumentRequirements";
import { PartnerOrgForm } from "@/components/network/PartnerOrgForm";
import { VenueManager } from "@/components/network/VenueManager";
import { VendorAvatar } from "@/components/network/VendorAvatar";
import { Button } from "@/components/network/ui/Button";
import { Badge } from "@/components/network/ui/Badge";
import { label } from "@/lib/network/labels";
import { requirePartnerOrg } from "@/lib/network/partner-org";
import { prisma } from "@/lib/network/prisma";
import { removePartnerCoordinator } from "@/lib/network/team-actions";

export default async function PartnerOrganizationPage() {
  const { user, ownerId, isOwner } = await requirePartnerOrg();
  const owner =
    ownerId === user.id
      ? user
      : await prisma.user.findUnique({
          where: { id: ownerId },
          include: { profile: { include: { categoryTags: true } }, membership: true },
        });
  const profile = owner?.profile ?? user.profile;
  if (!profile) {
    return <p className="text-ht-muted">No organization profile on file.</p>;
  }

  const [venues, team, docRequirements] = await Promise.all([
    prisma.savedVenue.findMany({
      where: { partnerId: ownerId },
      orderBy: { name: "asc" },
    }),
    prisma.partnerMember.findMany({
      where: { ownerId },
      include: { member: { include: { profile: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.partnerDocumentRequirement.findMany({
      where: { partnerId: ownerId },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <div className="space-y-12">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="ht-label text-ht-blue-bright">Partner</p>
          <h1 className="mt-1 text-3xl font-bold text-ht-cream">Organization</h1>
          <p className="mt-2 max-w-2xl text-sm text-ht-muted">
            This is how HiTouch and vendors see your company on opportunities you post.
            {isOwner ? "" : " Coordinators can post and hire; only the owner edits this profile."}
          </p>
        </div>
        <VendorAvatar
          name={profile.companyName ?? profile.name}
          type="BUSINESS"
          headshotUrl={null}
          logoUrl={profile.logoUrl}
          size="md"
        />
      </header>

      {isOwner ? (
        <PartnerOrgForm
          profile={{
            companyName: profile.companyName,
            contactPerson: profile.contactPerson,
            name: profile.name,
            phone: profile.phone,
            mailingAddress: profile.mailingAddress,
            bio: profile.bio,
            logoUrl: profile.logoUrl,
            socialLinks: profile.socialLinks,
          }}
        />
      ) : (
        <section className="border-2 border-ht-line bg-ht-panel p-5">
          <p className="font-semibold text-ht-cream">{profile.companyName ?? profile.name}</p>
          <p className="mt-1 text-sm text-ht-muted">
            {profile.contactPerson ?? profile.name}
            {profile.phone ? ` · ${profile.phone}` : ""}
          </p>
        </section>
      )}

      <PartnerDocumentRequirementsManager
        requirements={docRequirements.map((r) => ({
          id: r.id,
          label: r.label,
          description: r.description,
        }))}
        canEdit={isOwner}
      />

      <section className="max-w-2xl space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-ht-cream">Team</h2>
          <p className="mt-2 text-sm text-ht-muted">
            Coordinators use the same portal — they see this organization&apos;s opportunities, not
            a separate company.
          </p>
        </div>
        {isOwner ? <AddCoordinatorForm /> : null}
        <ul className="divide-y-2 divide-ht-line border-2 border-ht-line bg-ht-panel">
          <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="font-medium text-ht-cream">
                {profile.contactPerson ?? profile.name}
              </p>
              <p className="text-sm text-ht-muted">{owner?.email ?? user.email}</p>
            </div>
            <Badge variant="gold">{label("OWNER")}</Badge>
          </li>
          {team.map((seat) => (
            <li
              key={seat.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div>
                <p className="font-medium text-ht-cream">
                  {seat.member.profile?.name ?? seat.member.email}
                </p>
                <p className="text-sm text-ht-muted">{seat.member.email}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge>{label(seat.role)}</Badge>
                {isOwner ? (
                  <form action={removePartnerCoordinator.bind(null, seat.memberId)}>
                    <Button type="submit" size="sm" variant="ghost">
                      Remove
                    </Button>
                  </form>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="max-w-2xl space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-ht-cream">Saved venues</h2>
          <p className="mt-2 text-sm text-ht-muted">
            Addresses, load-in notes, and on-site contacts you reuse when posting opportunities.
          </p>
        </div>
        <VenueManager venues={venues} />
      </section>
    </div>
  );
}
