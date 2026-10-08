import { vendorNotificationPrefsSchema } from "@/lib/network/validation";

export type VendorNotificationPrefs = {
  invites: boolean;
  hired: boolean;
  messages: boolean;
  payments: boolean;
  announcements: boolean;
};

export const DEFAULT_VENDOR_NOTIFICATION_PREFS: VendorNotificationPrefs = {
  invites: true,
  hired: true,
  messages: true,
  payments: true,
  announcements: true,
};

export function parseNotificationPrefs(raw: unknown): VendorNotificationPrefs {
  const parsed = vendorNotificationPrefsSchema.safeParse(raw);
  if (!parsed.success) return { ...DEFAULT_VENDOR_NOTIFICATION_PREFS };
  return parsed.data;
}
