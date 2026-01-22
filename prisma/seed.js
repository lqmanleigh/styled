import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // 1️⃣ Upsert rules (ONE per category)
  const formalRule = await prisma.eventRule.upsert({
    where: { targetCategory: "formal" },
    update: {},
    create: {
      name: "Formal Events",
      targetCategory: "formal",
      priority: 3,
      enabled: true,
    },
  });

  const casualRule = await prisma.eventRule.upsert({
    where: { targetCategory: "casual" },
    update: {},
    create: {
      name: "Casual Events",
      targetCategory: "casual",
      priority: 2,
      enabled: true,
    },
  });

  const streetRule = await prisma.eventRule.upsert({
    where: { targetCategory: "streetwear" },
    update: {},
    create: {
      name: "Streetwear Events",
      targetCategory: "streetwear",
      priority: 1,
      enabled: true,
    },
  });

  // 2️⃣ Seed keywords (skip duplicates)
  await prisma.eventKeyword.createMany({
    data: [
      // Formal
      { keyword: "interview", ruleId: formalRule.id },
      { keyword: "corporate", ruleId: formalRule.id },
      { keyword: "business", ruleId: formalRule.id },
      { keyword: "wedding", ruleId: formalRule.id },
      { keyword: "kahwin", ruleId: formalRule.id }, // ✅ now supported
      { keyword: "ceremony", ruleId: formalRule.id },
      { keyword: "conference", ruleId: formalRule.id },
      { keyword: "presentation", ruleId: formalRule.id },
      { keyword: "exam", ruleId: formalRule.id },
      { keyword: "award", ruleId: formalRule.id },
      { keyword: "meeting", ruleId: formalRule.id },

      // Casual
      { keyword: "outing", ruleId: casualRule.id },
      { keyword: "shopping", ruleId: casualRule.id },
      { keyword: "gathering", ruleId: casualRule.id },
      { keyword: "hangout", ruleId: casualRule.id },

      // Streetwear
      { keyword: "social", ruleId: streetRule.id },
      { keyword: "concert", ruleId: streetRule.id },
      { keyword: "fashion", ruleId: streetRule.id },
      { keyword: "content", ruleId: streetRule.id },
      { keyword: "shoot", ruleId: streetRule.id },
    ],
    skipDuplicates: true, // 🔑 CRITICAL
  });

  console.log("✅ Event rules & keywords seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });