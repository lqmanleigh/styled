const { PrismaClient } = require("@prisma/client");
const { readFile } = require("fs/promises");
const path = require("path");

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

async function main() {
  for (const src of sources) {
    const items = await loadJson(src.file);
    const seenUrls = [];
    for (const item of items) {
      const name = (item.name || "").trim() || null;
      const url = item.url || null;
      const image = item.image || null;
      const scrapedAt = new Date();
      if (!url) continue; // skip entries without URL
      seenUrls.push(url);

      await prisma.product.upsert({
        where: { url },
        update: { name, image, brand: src.brand, scrapedAt },
        create: { name, image, url, brand: src.brand, scrapedAt },
      });
    }

    // Delete stale rows for this brand that are no longer present in the feed
    if (seenUrls.length > 0) {
      const { count } = await prisma.product.deleteMany({
        where: {
          brand: src.brand,
          url: { notIn: seenUrls },
        },
      });
      if (count > 0) {
        console.log(`Removed ${count} stale ${src.brand} rows not present in ${src.file}`);
      }
    } else {
      console.warn(`Skipped cleanup for ${src.brand}: no URLs found in ${src.file}`);
    }
  }
  console.log("Import complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
