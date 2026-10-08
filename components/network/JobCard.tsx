import Link from "next/link";
import type { CategoryTag, JobOpportunity } from "@/lib/generated/network-prisma/client";
import { Badge, eventStatusLabel, statusBadgeVariant } from "@/components/network/ui/Badge";
import { formatDay, formatMoney, formatTimeOn } from "@/lib/network/utils";

export type JobWithTag = JobOpportunity & { categoryTag: CategoryTag };

interface JobCardProps {
  job: JobWithTag;
  href?: string;
  extraRequiredDocs?: string[];
}

function TimingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-t border-ht-line py-2 first:border-t-0">
      <span className="ht-label shrink-0 text-ht-muted">{label}</span>
      <span className="text-right text-sm whitespace-nowrap text-ht-cream">{value}</span>
    </div>
  );
}

export function JobCard({ job, href, extraRequiredDocs }: JobCardProps) {
  const body = (
    <article className="flex h-full flex-col border-2 border-ht-line bg-ht-panel p-5 transition-colors hover:border-ht-gold/60">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge variant="blue">{job.categoryTag.name}</Badge>
        <Badge variant={statusBadgeVariant(job.status)}>{eventStatusLabel(job.status)}</Badge>
      </div>

      <h3 className="mt-4 text-lg font-semibold leading-snug text-ht-cream">
        {job.title}
      </h3>
      <p className="mt-1 text-sm text-ht-muted">{job.location}</p>

      <p className="mt-4 text-sm font-semibold text-ht-cream">
        {formatDay(job.eventStartTime)}
      </p>
      <div className="mt-1 mb-5">
        <TimingRow label="Setup" value={formatTimeOn(job.setupTime, job.eventStartTime)} />
        <TimingRow
          label="Live"
          value={`${formatTimeOn(job.eventStartTime, job.eventStartTime)} – ${formatTimeOn(job.eventEndTime, job.eventStartTime)}`}
        />
        <TimingRow
          label="Breakdown"
          value={formatTimeOn(job.breakdownTime, job.eventStartTime)}
        />
      </div>

      <div className="mt-auto space-y-2 border-t-2 border-ht-line pt-3">
        {extraRequiredDocs && extraRequiredDocs.length > 0 ? (
          <p className="text-xs text-ht-gold">
            +{extraRequiredDocs.length} client document
            {extraRequiredDocs.length === 1 ? "" : "s"} required to apply
          </p>
        ) : null}
        <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-ht-gold">
          {formatMoney(job.payRate.toString())}
        </span>
        <span className="ht-label text-ht-muted">
          {job.isOpenBidding ? "Open board" : "Invite only"}
        </span>
        </div>
      </div>
    </article>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {body}
      </Link>
    );
  }
  return body;
}
