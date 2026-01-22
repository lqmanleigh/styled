const { PrismaClient } = require("@prisma/client");
const { readFile } = require("fs/promises");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

const aiClient = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const BRAND_CATEGORY_MAP = {
  tomaz: "formal",
  "smart master": "casual",
  smartmaster: "casual",
  aegis: "streetwear"
};


const prisma = new PrismaClient();

const sources = [
  { file: "products.json", brand: "Aegis" },
  { file: "tomaz.json", brand: "Tomaz" },
  { file: "smart_master.json", brand: "Smart Master" },
];

async function loadJson(file) {
  try {
    const raw = await readFile(path.join(process.cwd(), "my_scraper", file), "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn(`Skipping ${file}: not found or unreadable (${err?.message || err})`);
    return [];
  }
}

async function classifyProductAI(product) {
  const name = product.name?.trim();
  const brand = product.brand?.trim();
  const category = product.category?.trim();
  const url = product.url;

  if (!name) {
    throw new Error("Missing product name for AI classification");
  }

  const prompt = `
You are a fashion product classifier.

Product name: ${name}
Brand: ${brand || "Unknown"}
Current category: ${category || "Unknown"}
Product URL: ${url}

Classify this product into:
- main category
- subcategory
- gender (men / women / unisex)
- occasion (casual, formal, outdoor, etc.)

Return JSON only.
`;

  const result = await aiClient.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }]
  });

  return result.text;
}



async function main() {

  // 🔹 Phase 1: Import JSON feeds
  for (const src of sources) {
    const items = await loadJson(src.file);
    const seenUrls = [];

    for (const item of items) {
      const name = (item.name || "").trim() || null;
      const url = item.url || null;
      const image = item.image || null;
      const scrapedAt = new Date();
      if (!url) continue;

      seenUrls.push(url);

      await prisma.product.upsert({
        where: { url },
        update: { name, image, brand: src.brand, scrapedAt },
        create: { name, image, url, brand: src.brand, scrapedAt },
      });
    }

    if (seenUrls.length > 0) {
      await prisma.product.deleteMany({
        where: {
          brand: src.brand,
          url: { notIn: seenUrls }
        }
      });
    }
  }

  console.log("Import complete");

  // 🔹 Phase 2: AI classification
  await runAIClassification();
}


main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

async function runAIClassification() {
  const products = await prisma.product.findMany({
    where: {
      aiLabel: null,
      url: { not: null }
    }
  });

  console.log(`AI classifying ${products.length} products...`);

  const fashionCategories = ["clothing", "apparel"];

  for (const product of products) {
    try {
      if (!product.name || product.name.trim() === "") {
        console.warn(`⚠️ Skipping AI (missing name): ${product.url}`);
        continue;
      }

      const raw = await classifyProductAI(product);

      const clean = raw
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      let parsed;
      try {
        parsed = JSON.parse(clean);
      } catch {
        throw new Error("AI returned invalid JSON");
      }

      // ✅ Fashion decision
      const isFashion = fashionCategories.includes(
        parsed.main_category?.toLowerCase()
      );

      // ✅ Brand-based category ONLY if fashion
      let finalCategory = null;

      if (isFashion) {
        const brandKey = product.brand
          ?.toLowerCase()
          .replace(/\s+/g, " ");

        finalCategory = BRAND_CATEGORY_MAP[brandKey] || null;
      }

      await prisma.product.update({
        where: { id: product.id },
        data: {
          aiLabel: clean,
          isFashion,
          category: finalCategory,
          aiProcessedAt: new Date()
        }
      });

      console.log(
        `✔ ${product.name} → fashion=${isFashion}, category=${finalCategory}`
      );
    } catch (err) {
      console.error(`❌ AI failed for ${product.url}`, err.message);
    }
  }
}


