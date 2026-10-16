/**
 * Create a personal overhead-admin account and email a set-password link (Resend smoke test).
 *
 *   RESEND_API_KEY=... NETWORK_PUBLIC_URL=https://… npx tsx scripts/provision-tester-account.ts
 */
import "dotenv/config";
import {
  createSetPasswordToken,
  networkPublicBaseUrl,
  sendSetPasswordEmail,
  setPasswordInviteUrl,
  unusablePasswordHash,
} from "../lib/network/password-reset";
import { prisma } from "../lib/network/prisma";

const email = (process.env.TESTER_EMAIL ?? "siquilward221@gmail.com").trim().toLowerCase();
const name = process.env.TESTER_NAME ?? "Unfavdemo";

async function main() {
  const hasResend = Boolean(process.env.RESEND_API_KEY?.trim());
  console.log(`Base URL: ${networkPublicBaseUrl()}`);
  console.log(`Resend: ${hasResend ? "enabled" : "MISSING — set RESEND_API_KEY to send"}`);
  console.log(`Account: ${email}`);

  let user = await prisma.user.findUnique({ where: { email }, include: { profile: true } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        passwordHash: await unusablePasswordHash(),
        role: "ADMIN",
        status: "APPROVED",
        adminScope: "SUPER",
        profile: { create: { name, type: "INDIVIDUAL" } },
      },
      include: { profile: true },
    });
    console.log("Created overhead admin");
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        role: "ADMIN",
        status: "APPROVED",
        adminScope: "SUPER",
        profile: user.profile
          ? { update: { name } }
          : { create: { name, type: "INDIVIDUAL" } },
      },
      include: { profile: true },
    });
    console.log("Updated existing → overhead admin");
  }

  const token = createSetPasswordToken(user.id);
  const link = setPasswordInviteUrl(token);

  if (!hasResend) {
    console.log("Manual set-password link (email not sent):");
    console.log(link);
    process.exitCode = 2;
    return;
  }

  const sent = await sendSetPasswordEmail({ to: email, name, token });
  console.log(`Email sent${sent?.id ? ` (${sent.id})` : ""}`);
  console.log(`Link: ${link}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
