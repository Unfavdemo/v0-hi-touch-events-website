import "dotenv/config";
import { prisma } from "../lib/network/prisma";

async function main() {
  const email = "chris.harris@hitouchinc.com";
  const user = await prisma.user.update({
    where: { email },
    data: {
      role: "ADMIN",
      status: "APPROVED",
      adminScope: "SUPER",
    },
    include: { profile: true },
  });
  console.log({
    email: user.email,
    name: user.profile?.name,
    role: user.role,
    adminScope: user.adminScope,
    label: "Overhead admin (SUPER)",
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
