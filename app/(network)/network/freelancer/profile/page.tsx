import Link from "next/link";
import { PortfolioItemRow, PortfolioUploadForm } from "@/components/network/freelancer/PortfolioUploadForm";
import { ProfileEditForm } from "./ProfileEditForm";
import { VendorAvatar } from "@/components/network/VendorAvatar";
import { requireUser } from "@/lib/network/auth";
import { prisma } from "@/lib/network/prisma";

export default async function FreelancerProfilePage() {
  const user = await requireUser("FREELANCER");
  const profile = user.profile;
  if (!profile) {
    return <p className="text-ht-muted">No profile on file.</p>;
  }

  const [tags, portfolio] = await Promise.all([
    prisma.categoryTag.findMany({ orderBy: { name: "asc" } }),
    prisma.vendorDocument.findMany({
      where: { vendorId: user.id, kind: "PORTFOLIO" },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="ht-label text-ht-gold">Vendor</p>
          <h1 className="mt-1 text-3xl font-bold text-ht-cream">Your profile</h1>
          <p className="mt-2 text-sm text-ht-muted">
            This is what partners see on the public network page. Paperwork lives under{" "}
            <Link href="/network/freelancer/documents" className="text-ht-gold hover:text-ht-gold-bright">
              Documents
            </Link>
            .
          </p>
        </div>
        <div className="flex items-center gap-4">
          <VendorAvatar
            name={profile.name}
            type={profile.type}
            headshotUrl={profile.headshotUrl}
            logoUrl={profile.logoUrl}
            size="md"
          />
          <Link
            href={`/network/${user.id}`}
            className="ht-label border-2 border-ht-line px-4 py-2 text-ht-gold hover:border-ht-gold"
          >
            View public page
          </Link>
        </div>
      </header>

      <ProfileEditForm
        profile={{
          name: profile.name,
          type: profile.type,
          phone: profile.phone,
          mailingAddress: profile.mailingAddress,
          accountEmail: user.email,
          bio: profile.bio,
          companyName: profile.companyName,
          headshotUrl: profile.headshotUrl,
          logoUrl: profile.logoUrl,
          socialLinks: profile.socialLinks,
          categoryTagIds: profile.categoryTags.map((t) => t.id),
          defaultRate: profile.defaultRate ? profile.defaultRate.toString() : "",
          travelRadiusMiles: profile.travelRadiusMiles ?? "",
          crewSize: profile.crewSize ?? "",
          equipmentNotes: profile.equipmentNotes,
        }}
        tags={tags.map((t) => ({ id: t.id, name: t.name }))}
      />

      <section className="max-w-2xl border-2 border-ht-line bg-ht-panel p-6">
        <h2 className="text-lg font-semibold text-ht-cream">Portfolio</h2>
        <p className="mt-1 text-sm text-ht-muted">
          Photos or PDFs shown on your public network page.
        </p>
        {portfolio.length > 0 ? (
          <ul className="mt-4 divide-y-2 divide-ht-line border-2 border-ht-line">
            {portfolio.map((doc) => (
              <PortfolioItemRow key={doc.id} id={doc.id} label={doc.label} />
            ))}
          </ul>
        ) : null}
        <div className="mt-6">
          <PortfolioUploadForm />
        </div>
      </section>
    </div>
  );
}
