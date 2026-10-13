/**
 * Upsert Hitouch staff network admins and email set-password links via Resend.
 *
 *   RESEND_API_KEY=... NETWORK_PUBLIC_URL=https://test.example.com \
 *     npx tsx scripts/provision-network-staff.ts
 *
 * Scopes: SUPER = overhead admin; EVENT = day-of event admin.
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

/** SUPER = overhead admin; EVENT = day-of event admin */
const STAFF: { email: string; name: string; adminScope: "SUPER" | "EVENT" }[] = [
  { email: "mianna.smith@hitouchinc.com", name: "Mianna Smith", adminScope: "EVENT" },
  { email: "tori.henry@hitouchinc.com", name: "Tori Henry", adminScope: "EVENT" },
  { email: "chris.harris@hitouchinc.com", name: "Chris Harris", adminScope: "SUPER" },
  { email: "david.harris@hitouchinc.com", name: "David Harris", adminScope: "EVENT" },
  { email: "marlika.harris@hitouchinc.com", name: "Marlika Harris", adminScope: "SUPER" },
  { email: "feliciawilliams@hitouchinc.com", name: "Felicia Williams", adminScope: "SUPER" },
];

async function main() {
  const base = networkPublicBaseUrl();
  const hasResend = Boolean(process.env.RESEND_API_KEY?.trim());
  console.log(`Base URL for invite links: ${base}`);
  console.log(`Resend: ${hasResend ? "enabled" : "MISSING — accounts will still be created"}`);

  for (const person of STAFF) {
    const email = person.email.toLowerCase();
    let user = await prisma.user.findUnique({ where: { email }, include: { profile: true } });

    const scopeLabel = person.adminScope === "SUPER" ? "overhead" : "day-of event";

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          passwordHash: await unusablePasswordHash(),
          role: "ADMIN",
          status: "APPROVED",
          adminScope: person.adminScope,
          profile: {
            create: {
              name: person.name,
              type: "INDIVIDUAL",
            },
          },
        },
        include: { profile: true },
      });
      console.log(`Created ${scopeLabel} admin: ${email}`);
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          role: "ADMIN",
          status: "APPROVED",
          adminScope: person.adminScope,
          profile: user.profile
            ? { update: { name: person.name } }
            : { create: { name: person.name, type: "INDIVIDUAL" } },
        },
        include: { profile: true },
      });
      console.log(`Updated → ${scopeLabel} admin: ${email}`);
    }

    const token = createSetPasswordToken(user.id);
    const link = setPasswordInviteUrl(token);

    if (hasResend) {
      try {
        const sent = await sendSetPasswordEmail({
          to: email,
          name: person.name,
          token,
        });
        console.log(`  Email sent${sent?.id ? ` (${sent.id})` : ""}`);
      } catch (err) {
        console.error(`  Email FAILED for ${email}:`, err);
        console.log(`  Manual link: ${link}`);
      }
    } else {
      console.log(`  Manual set-password link: ${link}`);
    }
  }

  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
