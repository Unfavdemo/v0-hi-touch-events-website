import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { sendTransactionalEmail } from "@/lib/email/transactional";
import { hashPassword } from "@/lib/network/auth";
import { prisma } from "@/lib/network/prisma";

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const PURPOSE = "set-password";

function getSecret(): string {
  return (
    process.env.NETWORK_SESSION_SECRET?.trim() ||
    process.env.SESSION_SECRET?.trim() ||
    "dev-only-insecure-network-secret-change-me"
  );
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

/** Public base URL for invite / reset links (no trailing slash). */
export function networkPublicBaseUrl(): string {
  const explicit = process.env.NETWORK_PUBLIC_URL?.trim().replace(/\/$/, "");
  if (explicit) return explicit;

  const testHost = process.env.NETWORK_TEST_HOST?.trim()
    .replace(/^https?:\/\//, "")
    .split("/")[0]
    .split(":")[0];
  if (testHost && !testHost.includes("localhost")) {
    return `https://${testHost}`;
  }

  const site =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (site) return site.replace(/\/$/, "");

  return "http://localhost:3000";
}

export function setPasswordInviteUrl(token: string): string {
  const base = networkPublicBaseUrl();
  let pretty = false;
  try {
    const host = new URL(base).hostname.toLowerCase();
    pretty = host.startsWith("test.") && !host.includes("localhost");
  } catch {
    /* ignore */
  }
  // Pretty path on test. host; /network path on apex / local.
  const path = pretty ? "/set-password" : "/network/set-password";
  return `${base}${path}?token=${encodeURIComponent(token)}`;
}

export function createSetPasswordToken(userId: string): string {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const nonce = randomBytes(8).toString("hex");
  const payload = `${PURPOSE}:${userId}:${expiresAt}:${nonce}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySetPasswordToken(token: string | undefined): string | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;
  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  const expected = sign(payload);
  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  const [purpose, userId, expStr] = payload.split(":");
  const expiresAt = Number(expStr);
  if (
    purpose !== PURPOSE ||
    !userId ||
    !Number.isFinite(expiresAt) ||
    Date.now() >= expiresAt
  ) {
    return null;
  }
  return userId;
}

/** Random hash so the account cannot be signed into until password is set. */
export async function unusablePasswordHash(): Promise<string> {
  return hashPassword(randomBytes(32).toString("hex"));
}

export async function sendSetPasswordEmail(params: {
  to: string;
  name: string;
  token: string;
}): Promise<{ id: string } | null> {
  const link = setPasswordInviteUrl(params.token);
  const first = params.name.split(/\s+/)[0] || "there";

  return sendTransactionalEmail({
    to: params.to,
    subject: "Set your HiTouch Solutions password",
    html: `
      <div style="font-family:Helvetica,Arial,sans-serif;line-height:1.5;color:#16162a;max-width:520px">
        <p>Hi ${escapeHtml(first)},</p>
        <p>Your HiTouch Solutions admin account is ready. Please set a password to sign in:</p>
        <p style="margin:28px 0">
          <a href="${escapeHtml(link)}"
             style="display:inline-block;background:#292a75;color:#fff;text-decoration:none;padding:12px 20px;font-weight:600">
            Set your password
          </a>
        </p>
        <p style="font-size:14px;color:#5c5d73">This link expires in 7 days. If you did not expect this email, you can ignore it.</p>
        <p style="font-size:13px;color:#5c5d73;word-break:break-all">Or open:<br/>${escapeHtml(link)}</p>
        <p style="margin-top:28px">— HiTouch</p>
      </div>
    `.trim(),
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function findUserForSetPasswordToken(token: string) {
  const userId = verifySetPasswordToken(token);
  if (!userId) return null;
  return prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });
}
