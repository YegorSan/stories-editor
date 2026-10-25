import { Plan, PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";

  if (!email || !password) {
    console.log("Skip seed: set ADMIN_EMAIL and ADMIN_PASSWORD");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      passwordHash,
      role: Role.ADMIN,
      name: "Admin",
    },
    update: {
      passwordHash,
      role: Role.ADMIN,
    },
  });

  // Admin always has Pro for local testing and support.
  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  await prisma.subscription.upsert({
    where: { userId: user.id },
    create: { userId: user.id, plan: Plan.YEAR, expiresAt },
    update: { plan: Plan.YEAR, expiresAt },
  });

  console.log(`Admin ready: ${user.email} (${user.id}), Pro until ${expiresAt.toISOString()}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
