import { VendorSettingsForm } from "@/components/network/freelancer/VendorSettingsForm";
import { VendorHeader } from "@/components/network/freelancer/VendorHeader";
import { VendorSettingsTip } from "@/components/network/help/Tips";
import { requireUser } from "@/lib/network/auth";
import { parseNotificationPrefs } from "@/lib/network/vendor-prefs";

export default async function FreelancerSettingsPage() {
  const user = await requireUser("FREELANCER");
  const profile = user.profile;
  if (!profile) return <p className="text-ht-muted">No profile on file.</p>;

  const prefs = parseNotificationPrefs(profile.notificationPrefs);

  return (
    <div className="space-y-8">
      <VendorHeader title="Settings" tip={<VendorSettingsTip />}>
        Password and private contact details — not shown on your public network page.
      </VendorHeader>

      <VendorSettingsForm
        timezone={profile.timezone}
        emergencyContact={profile.emergencyContact}
        prefs={prefs}
      />
    </div>
  );
}
