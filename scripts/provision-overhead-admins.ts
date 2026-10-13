/**
 * Upsert specific overhead (SUPER) admins and email set-password links.
 *
 *   NETWORK_PUBLIC_URL=https://www.hitouchevents.com npx tsx scripts/provision-overhead-admins.ts
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

const STAFF: { email: string; name: string }[] = [
  { email: "marlika.harris@hitouchinc.com", name: "Marlika Harris" },
  { email: "feliciawilliams@hitouchinc.com", name: "Felicia Williams" },
];

async function main() {
  const hasResend = Boolean(process.env.RESEND_API_KEY?.trim());
  console.log(`Base URL: ${networkPublicBaseUrl()}`);
  console.log(`Resend: ${hasResend ? "enabled" : "MISSING"}`);

  for (const person of STAFF) {
    const email = person.email.toLowerCase();
    let user = await prisma.user.findUnique({ where: { email }, include: { profile: true } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          passwordHash: await unusablePasswordHash(),
          role: "ADMIN",
          status: "APPROVED",
          adminScope: "SUPER",
          profile: { create: { name: person.name, type: "INDIVIDUAL" } },
        },
        include: { profile: true },
      });
      console.log(`Created overhead admin: ${email}`);
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          role: "ADMIN",
          status: "APPROVED",
          adminScope: "SUPER",
          profile: user.profile
            ? { update: { name: person.name } }
            : { create: { name: person.name, type: "INDIVIDUAL" } },
        },
        include: { profile: true },
      });
      console.log(`Updated → overhead admin: ${email}`);
    }

    const token = createSetPasswordToken(user.id);
    const link = setPasswordInviteUrl(token);
    if (!hasResend) {
      console.log(`  Manual link: ${link}`);
      continue;
    }
    try {
      const sent = await sendSetPasswordEmail({ to: email, name: person.name, token });
      console.log(`  Email sent${sent?.id ? ` (${sent.id})` : ""}`);
    } catch (err) {
      console.error(`  Email FAILED for ${email}:`, err);
      console.log(`  Manual link: ${link}`);
    }
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
