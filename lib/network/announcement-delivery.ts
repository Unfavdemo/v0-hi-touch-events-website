import { parseNotificationPrefs } from "@/lib/network/vendor-prefs";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export type AnnouncementRecipient = {
  id: string;
  email: string;
  phone: string | null;
  allowAnnouncements: boolean;
};

export function normalizeSmsPhone(phone: string | null | undefined): string | null {
  if (!phone?.trim()) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (phone.trim().startsWith("+") && digits.length >= 10) return `+${digits}`;
  return null;
}

export function smsBody(message: string): string {
  const trimmed = message.trim();
  const suffix = ` HiTouch: ${APP_URL.replace(/^https?:\/\//, "")}`;
  const max = 480;
  if (trimmed.length + suffix.length <= max) return trimmed + suffix;
  return `${trimmed.slice(0, max - suffix.length - 1)}…${suffix}`;
}

export async function sendAnnouncementEmail(to: string, message: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.ANNOUNCEMENT_FROM_EMAIL?.trim() ?? "HiTouch Solutions <announcements@hitouch.io>";

  if (!apiKey) {
    console.info(
      `[announcement email] (dev) To: ${to}\n${message.length > 200 ? `${message.slice(0, 200)}…` : message}`,
    );
    return true;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "HiTouch announcement",
      text: `${message.trim()}\n\n— HiTouch Solutions\n${APP_URL}`,
    }),
  });

  if (!res.ok) {
    console.error("[announcement email] failed", to, await res.text());
    return false;
  }
  return true;
}

export async function sendAnnouncementSms(to: string, message: string): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  const from = process.env.TWILIO_FROM_NUMBER?.trim();

  if (!sid || !token || !from) {
    console.info(`[announcement sms] (dev) To: ${to}\n${smsBody(message)}`);
    return true;
  }

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      To: to,
      From: from,
      Body: smsBody(message),
    }),
  });

  if (!res.ok) {
    console.error("[announcement sms] failed", to, await res.text());
    return false;
  }
  return true;
}

export function recipientAllowsAnnouncements(
  role: string,
  notificationPrefs: unknown,
): boolean {
  if (role !== "FREELANCER") return true;
  return parseNotificationPrefs(notificationPrefs).announcements;
}
