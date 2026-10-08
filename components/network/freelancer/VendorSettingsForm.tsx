"use client";

import { useActionState } from "react";
import { Button } from "@/components/network/ui/Button";
import { Input } from "@/components/network/ui/Input";
import {
  changeVendorPassword,
  updateVendorSettings,
} from "@/lib/network/vendor-settings-actions";
import type { VendorNotificationPrefs } from "@/lib/network/vendor-prefs";

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
];

export function VendorSettingsForm({
  timezone,
  emergencyContact,
  prefs,
}: {
  timezone: string;
  emergencyContact: string | null;
  prefs: VendorNotificationPrefs;
}) {
  const [settingsState, settingsAction, settingsPending] = useActionState(updateVendorSettings, {});
  const [passwordState, passwordAction, passwordPending] = useActionState(changeVendorPassword, {});

  return (
    <div className="space-y-10">
      <form action={settingsAction} className="max-w-lg space-y-5 border-2 border-ht-line bg-ht-panel p-6">
        <h2 className="text-lg font-semibold text-ht-cream">Account preferences</h2>
        <label className="block">
          <span className="ht-label text-ht-muted">Timezone</span>
          <select
            name="timezone"
            defaultValue={timezone}
            className="mt-2 w-full border-2 border-ht-line bg-ht-panel-2 px-3 py-2 text-ht-cream"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz.replace("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <Input
          label="Emergency contact"
          name="emergencyContact"
          defaultValue={emergencyContact ?? ""}
          hint="Optional — who we should call if we can't reach you on site"
        />
        <div>
          <p className="ht-label text-ht-muted">Notification preferences</p>
          <p className="mt-1 text-xs text-ht-muted">
            Saved for your account. In-app alerts still appear in the portal for now.
          </p>
          <ul className="mt-3 space-y-2 text-sm text-ht-cream">
            {(
              [
                ["prefInvites", "invites", "Opportunity invites"],
                ["prefHired", "hired", "Hired / application updates"],
                ["prefMessages", "messages", "Job messages"],
                ["prefPayments", "payments", "Payment marked by partner"],
                ["prefAnnouncements", "announcements", "HiTouch announcements"],
              ] as const
            ).map(([name, key, label]) => (
              <li key={name}>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    name={name}
                    value="1"
                    defaultChecked={prefs[key]}
                    className="accent-[#34318f]"
                  />
                  {label}
                </label>
              </li>
            ))}
          </ul>
        </div>
        {settingsState.error ? <p className="text-sm text-ht-danger">{settingsState.error}</p> : null}
        {settingsState.ok ? <p className="text-sm text-ht-gold">Settings saved.</p> : null}
        <Button type="submit" disabled={settingsPending}>
          {settingsPending ? "Saving…" : "Save settings"}
        </Button>
      </form>

      <form action={passwordAction} className="max-w-lg space-y-5 border-2 border-ht-line bg-ht-panel p-6">
        <h2 className="text-lg font-semibold text-ht-cream">Change password</h2>
        <Input label="Current password" name="currentPassword" type="password" autoComplete="current-password" required />
        <Input label="New password" name="newPassword" type="password" autoComplete="new-password" required minLength={8} />
        <Input
          label="Confirm new password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
        {passwordState.error ? <p className="text-sm text-ht-danger">{passwordState.error}</p> : null}
        {passwordState.ok ? <p className="text-sm text-ht-gold">Password updated.</p> : null}
        <Button type="submit" disabled={passwordPending}>
          {passwordPending ? "Updating…" : "Update password"}
        </Button>
      </form>
    </div>
  );
}
