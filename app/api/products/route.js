import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

async function readJson(filePath) {
  try {
    const data = await readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export async function GET() {
  const base = process.cwd();
  const sources = [
    path.join(base, "my_scraper", "products.json"),
    path.join(base, "my_scraper", "tomaz.json"),
    path.join(base, "my_scraper", "smart_master.json"),
  ];

  const results = (
    await Promise.all(sources.map((file) => readJson(file)))
  ).flat();

  return NextResponse.json(results);
}

