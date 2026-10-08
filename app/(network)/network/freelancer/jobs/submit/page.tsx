import { JobForm } from "@/components/network/JobForm";
import { requireUser } from "@/lib/network/auth";
import { prisma } from "@/lib/network/prisma";

export default async function FreelancerSubmitJobPage() {
  await requireUser("FREELANCER");
  const tags = await prisma.categoryTag.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <p className="ht-label text-ht-gold">Vendor</p>
      <h1 className="mt-1 text-3xl font-bold text-ht-cream">Share an opportunity</h1>
      <p className="mt-2 text-sm text-ht-muted">
        Booked a gig you can&apos;t fully staff? Share it with the network. HiTouch verifies
        it, invites other matched vendors to apply, and handles hiring for you.
      </p>
      <div className="mt-8">
        <JobForm tags={tags.map((t) => ({ id: t.id, name: t.name }))} />
      </div>
    </div>
  );
}
