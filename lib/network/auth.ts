import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import bcrypt from "bcryptjs";
import type { Role, UserStatus } from "@/lib/generated/network-prisma/client";
import { prisma } from "@/lib/network/prisma";

const COOKIE_NAME = "hitouch_network_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getSecret(): string {
  return (
    process.env.NETWORK_SESSION_SECRET?.trim() ||
    process.env.SESSION_SECRET?.trim() ||
    "dev-only-insecure-network-secret-change-me"
  );
}

/** Secure cookies only on HTTPS hosts. Local HTTP (dev or `next start`) must stay false or the browser will not save the login. */
function cookieShouldBeSecure(): boolean {
  if (process.env.COOKIE_SECURE === "0") return false;
  if (process.env.COOKIE_SECURE === "1") return true;
  return Boolean(process.env.VERCEL);
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export function createSessionToken(userId: string): string {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = `${userId}:${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): string | null {
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
  const [userId, expStr] = payload.split(":");
  const expiresAt = Number(expStr);
  if (!userId || !Number.isFinite(expiresAt) || Date.now() >= expiresAt) {
    return null;
  }
  return userId;
}

export async function setSessionCookie(userId: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, createSessionToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: cookieShouldBeSecure(),
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: cookieShouldBeSecure(),
    path: "/",
    maxAge: 0,
  });
}

export const getCurrentUser = cache(async () => {
  const store = await cookies();
  const userId = verifySessionToken(store.get(COOKIE_NAME)?.value);
  if (!userId) return null;
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: { include: { categoryTags: true } },
      membership: true,
    },
  });
});

export type SessionUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export function roleHome(user: { role: Role; status: UserStatus }): string {
  if (user.status !== "APPROVED") return "/network/pending";
  switch (user.role) {
    case "ADMIN":
      return "/network/admin";
    case "PARTNER":
      return "/network/partner";
    case "FREELANCER":
      return "/network/freelancer";
  }
}

/** Guard for role-gated layouts. Redirects instead of returning null. */
export async function requireUser(role?: Role): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/network/login");
  if (user.status !== "APPROVED") redirect("/network/pending");
  if (role && user.role !== role) redirect(roleHome(user));
  return user;
}

export function hasActiveMembership(user: SessionUser): boolean {
  const m = user.membership;
  if (!m) return false;
  if (m.tier === "BETA_FREE") return true;
  return m.status === "ACTIVE" || m.status === "TRIALING";
}
