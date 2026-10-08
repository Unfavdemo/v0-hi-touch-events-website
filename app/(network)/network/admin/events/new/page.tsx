import Link from "next/link";
import { AdminHeader } from "@/components/network/admin/AdminHeader";
import { PartnerEventCreateForm } from "@/components/network/partner/PartnerEventCreateForm";
import { requireAdminEventsAccess } from "@/lib/network/event-organizer";

export default async function AdminNewEventPage() {
  await requireAdminEventsAccess();

  return (
    <div className="space-y-8">
      <Link href="/network/admin/events" className="ht-label text-ht-muted hover:text-ht-gold">
        ← Events
      </Link>
      <AdminHeader title="Create event">
        Opportunity admins can create events and post roles that go live immediately — no
        partner approval queue.
      </AdminHeader>
      <PartnerEventCreateForm />
    </div>
  );
}
