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
  const raw = await readFile(path.join(process.cwd(), "my_scraper", file), "utf8");
  const data = JSON.parse(raw);
  return Array.isArray(data) ? data : [];
}

async function main() {
  for (const src of sources) {
    const items = await loadJson(src.file);
    for (const item of items) {
      const name = (item.name || "").trim() || null;
      const url = item.url || null;
      const image = item.image || null;
      if (!url) continue; // skip entries without URL

      await prisma.product.upsert({
        where: { url },
        update: { name, image, brand: src.brand },
        create: { name, image, url, brand: src.brand },
      });
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

