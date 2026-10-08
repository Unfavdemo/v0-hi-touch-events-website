import { AdminHeader } from "@/components/network/admin/AdminHeader";
import { SettingsForm } from "@/components/network/admin/SettingsForm";
import { requireSuperAdmin } from "@/lib/network/admin-rbac";
import { getPlatformSettings } from "@/lib/network/platform-settings";
import { VENDOR_AGREEMENT_VERSION } from "@/lib/network/vendor-agreement";

export default async function AdminSettingsPage() {
  await requireSuperAdmin();
  const settings = await getPlatformSettings();

  return (
    <div className="space-y-8">
      <AdminHeader title="Settings">
        Rating thresholds and how many vendors matching invites per opportunity. Partner and admin
        help text in the sidebar uses these live values. The vendor agreement version lives
        in code.
      </AdminHeader>
      <section className="border-2 border-ht-line bg-ht-panel p-6">
        <SettingsForm {...settings} />
      </section>
      <p className="text-sm text-ht-muted">
        Current vendor agreement version: <span className="text-ht-cream">{VENDOR_AGREEMENT_VERSION}</span>
        . Change that in the agreement file when you publish a new copy.
      </p>
    </div>
  );
}
