import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding started...");

  // 1. Seed Districts (Locations)
  const districts = [
    "Aizawl",
    "Lunglei",
    "Siaha",
    "Champhai",
    "Kolasib",
    "Serchhip",
    "Lawngtlai",
    "Mamit",
    "Saitual",
    "Khawzawl",
    "Hnahthial",
  ];

  console.log("Seeding districts (locations)...");
  for (const name of districts) {
    await prisma.location.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // 2. Seed Categories
  const categories = [
    "Sorkar Hna (Government Job)",
    "Private Sector",
    "Office Assistant / Clerk",
    "Driver / Delivery",
    "Hotel / Restaurant",
    "Retail / Shop Assistant",
    "Security Guard",
    "Teaching / Education",
    "Healthcare / Nurse",
    "Domestic Help / Maid",
  ];

  console.log("Seeding categories...");
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // 3. Seed Default Administrator
  console.log("Seeding default admin...");
  const adminUsername = "admin";
  const passwordHash = await bcrypt.hash("admin123", 10);

  await prisma.admin.upsert({
    where: { username: adminUsername },
    update: { passwordHash },
    create: {
      username: adminUsername,
      passwordHash,
    },
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
