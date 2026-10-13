import "dotenv/config";
import { prisma } from "../lib/network/prisma";

const UPDATES: { email: string; adminScope: "SUPER" | "EVENT" }[] = [
  { email: "mianna.smith@hitouchinc.com", adminScope: "EVENT" },
  { email: "tori.henry@hitouchinc.com", adminScope: "EVENT" },
  { email: "david.harris@hitouchinc.com", adminScope: "EVENT" },
  { email: "chris.harris@hitouchinc.com", adminScope: "SUPER" },
];

async function main() {
  for (const row of UPDATES) {
    const user = await prisma.user.update({
      where: { email: row.email },
      data: { role: "ADMIN", status: "APPROVED", adminScope: row.adminScope },
      include: { profile: true },
    });
    console.log({
      email: user.email,
      name: user.profile?.name,
      adminScope: user.adminScope,
      label: row.adminScope === "SUPER" ? "overhead" : "day-of event",
    });
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
