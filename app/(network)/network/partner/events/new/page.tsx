import Link from "next/link";
import { PartnerEventCreateForm } from "@/components/network/partner/PartnerEventCreateForm";
import { requirePartnerOrg } from "@/lib/network/partner-org";

export default async function PartnerNewEventPage() {
  await requirePartnerOrg();

  return (
    <div className="space-y-8">
      <Link href="/network/partner/events" className="ht-label text-ht-muted hover:text-ht-gold">
        ← Events
      </Link>
      <div>
        <p className="ht-label text-ht-blue-bright">Partner</p>
        <h1 className="mt-1 text-3xl font-bold text-ht-cream">Create event</h1>
        <p className="mt-2 max-w-2xl text-sm text-ht-muted">
          Use events for galas, festivals, or multi-vendor gigs. After you create it, post
          opportunities inside the event or connect ones you already have.
        </p>
      </div>
      <PartnerEventCreateForm />
    </div>
  );
}
