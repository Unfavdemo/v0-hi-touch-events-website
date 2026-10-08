import Link from "next/link";
import { requirePartnerOrg } from "@/lib/network/partner-org";
import { prisma } from "@/lib/network/prisma";
import { formatDateTime } from "@/lib/network/utils";

export default async function PartnerMessagesPage() {
  const { ownerId } = await requirePartnerOrg();
  const jobs = await prisma.jobOpportunity.findMany({
    where: {
      postedById: ownerId,
      assignedFreelancerId: { not: null },
      status: { in: ["FILLED", "COMPLETED"] },
    },
    include: {
      assignedFreelancer: { include: { profile: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { sender: { include: { profile: true } } },
      },
      _count: { select: { messages: true } },
    },
    orderBy: { eventStartTime: "desc" },
  });

  return (
    <div className="space-y-8">
      <header>
        <p className="ht-label text-ht-blue-bright">Partner</p>
        <h1 className="mt-1 text-3xl font-bold text-ht-cream">Messages</h1>
        <p className="mt-2 max-w-2xl text-sm text-ht-muted">
          Threads open after you hire. Use them for load-in, parking, and day-of timing so
          it isn&apos;t stuck in texts.
        </p>
      </header>

      {jobs.length === 0 ? (
        <p className="border-2 border-ht-line bg-ht-panel px-5 py-8 text-center text-sm text-ht-muted">
          Messages appear here after you hire someone.
        </p>
      ) : (
        <ul className="divide-y-2 divide-ht-line border-2 border-ht-line bg-ht-panel">
          {jobs.map((job) => {
            const last = job.messages[0];
            const vendor = job.assignedFreelancer;
            return (
              <li key={job.id}>
                <Link href={`/network/partner/jobs/${job.id}`} className="block px-5 py-4 hover:bg-ht-panel-2">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ht-cream">{job.title}</p>
                      <p className="mt-1 text-sm text-ht-muted">
                        {vendor?.profile?.name ?? vendor?.email}
                        {job._count.messages
                          ? ` · ${job._count.messages} message${job._count.messages === 1 ? "" : "s"}`
                          : " · No messages yet"}
                      </p>
                      {last ? (
                        <p className="mt-2 line-clamp-2 text-sm text-ht-cream">{last.body}</p>
                      ) : null}
                    </div>
                    {last ? (
                      <p className="text-xs text-ht-muted">{formatDateTime(last.createdAt)}</p>
                    ) : null}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
