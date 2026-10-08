import { Button } from "@/components/network/ui/Button";
import { markVendorArrived, markVendorWrapped } from "@/lib/network/checkin-actions";
import { canMarkArrived, canMarkWrapped, checkInLabel } from "@/lib/network/checkin";
import { formatDateTime } from "@/lib/network/utils";
import type { JobOpportunity } from "@/lib/generated/network-prisma/client";

export function CheckInStatus({
  job,
}: {
  job: Pick<JobOpportunity, "vendorArrivedAt" | "vendorWrappedAt">;
}) {
  const label = checkInLabel(job);
  if (!label && !job.vendorArrivedAt) {
    return <p className="text-sm text-ht-muted">Vendor hasn&apos;t checked in yet.</p>;
  }
  return (
    <ul className="space-y-1 text-sm text-ht-cream">
      {job.vendorArrivedAt ? (
        <li>
          On site {formatDateTime(job.vendorArrivedAt)}
        </li>
      ) : null}
      {job.vendorWrappedAt ? (
        <li>
          Wrapped {formatDateTime(job.vendorWrappedAt)}
        </li>
      ) : null}
    </ul>
  );
}

export function VendorCheckInButtons({
  job,
}: {
  job: Pick<
    JobOpportunity,
    "id" | "status" | "vendorArrivedAt" | "vendorWrappedAt" | "setupTime" | "breakdownTime"
  >;
}) {
  const arrive = canMarkArrived(job);
  const wrap = canMarkWrapped(job);
  if (!arrive && !wrap && !job.vendorArrivedAt) {
    return (
      <p className="text-sm text-ht-muted">
        Check-in opens four hours before setup.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      <CheckInStatus job={job} />
      {arrive ? (
        <form action={markVendorArrived.bind(null, job.id)}>
          <Button type="submit">I&apos;m on site</Button>
        </form>
      ) : null}
      {wrap ? (
        <form action={markVendorWrapped.bind(null, job.id)}>
          <Button type="submit">I&apos;m wrapped</Button>
        </form>
      ) : null}
    </div>
  );
}
