import Link from "next/link";
import { redirect } from "next/navigation";
import { CrewMemberForm } from "@/components/network/freelancer/CrewMemberForm";
import { VendorHeader } from "@/components/network/freelancer/VendorHeader";
import { VendorCrewTip } from "@/components/network/help/Tips";
import { DeleteCrewMemberButton } from "@/components/network/freelancer/DeleteCrewMemberButton";
import { JobCrewAssignForm } from "@/components/network/freelancer/JobCrewAssignForm";
import { Badge, eventStatusLabel, statusBadgeVariant } from "@/components/network/ui/Badge";
import { requireUser } from "@/lib/network/auth";
import { prisma } from "@/lib/network/prisma";
import { formatDateTime } from "@/lib/network/utils";

export default async function FreelancerCrewPage() {
  const user = await requireUser("FREELANCER");
  if (user.profile?.type !== "BUSINESS") redirect("/network/freelancer");

  const [members, bookedJobs] = await Promise.all([
    prisma.vendorCrewMember.findMany({
      where: { vendorId: user.id },
      orderBy: { name: "asc" },
    }),
    prisma.jobOpportunity.findMany({
      where: {
        assignedFreelancerId: user.id,
        status: { in: ["FILLED", "COMPLETED"] },
      },
      include: {
        categoryTag: true,
        crewAssignments: { select: { crewMemberId: true } },
      },
      orderBy: { eventStartTime: "desc" },
      take: 12,
    }),
  ]);

  return (
    <div className="space-y-10">
      <VendorHeader title="Crew" tip={<VendorCrewTip />}>
        Build your on-site roster, then assign people to each booked opportunity so partners know
        who is coming.
      </VendorHeader>

      <div className="grid gap-8 lg:grid-cols-2">
        <CrewMemberForm />
        <section className="border-2 border-ht-line bg-ht-panel p-5">
          <h2 className="text-lg font-semibold text-ht-cream">Roster ({members.length})</h2>
          {members.length === 0 ? (
            <p className="mt-4 text-sm text-ht-muted">No crew yet.</p>
          ) : (
            <ul className="mt-4 divide-y-2 divide-ht-line">
              {members.map((m) => (
                <li key={m.id} className="flex flex-wrap justify-between gap-2 py-3">
                  <div>
                    <p className="font-semibold text-ht-cream">{m.name}</p>
                    <p className="text-sm text-ht-muted">
                      {m.role}
                      {m.phone ? ` · ${m.phone}` : ""}
                    </p>
                  </div>
                  <DeleteCrewMemberButton memberId={m.id} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section>
        <h2 className="ht-label text-ht-muted">Assign to opportunities</h2>
        {bookedJobs.length === 0 ? (
          <p className="mt-4 text-sm text-ht-muted">Booked opportunities show up here.</p>
        ) : (
          <ul className="mt-4 space-y-6">
            {bookedJobs.map((job) => (
              <li key={job.id} className="border-2 border-ht-line bg-ht-panel p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/network/freelancer/jobs/${job.id}`}
                      className="font-semibold text-ht-cream hover:text-ht-gold"
                    >
                      {job.title}
                    </Link>
                    <p className="mt-1 text-sm text-ht-muted">
                      {job.categoryTag.name} · {formatDateTime(job.eventStartTime)}
                    </p>
                  </div>
                  <Badge variant={statusBadgeVariant(job.status)}>
                    {eventStatusLabel(job.status)}
                  </Badge>
                </div>
                <div className="mt-4">
                  <JobCrewAssignForm
                    jobId={job.id}
                    members={members.map((m) => ({ id: m.id, name: m.name, role: m.role }))}
                    assignedIds={job.crewAssignments.map((a) => a.crewMemberId)}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
