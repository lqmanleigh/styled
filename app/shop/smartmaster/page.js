import Layout from "../../components/Layout";
import Image from "next/image";
import Link from "next/link";
import { readFile } from "fs/promises";
import path from "path";

async function loadProducts() {
  const file = path.join(process.cwd(), "my_scraper", "smart_master.json");
  try {
    const raw = await readFile(file, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function SmartMasterShopPage({ searchParams }) {
  const products = await loadProducts();
  const category = (searchParams?.category || "all").toLowerCase();
  const navLinks = [
    { href: "/shop/aegis", label: "Aegis" },
    { href: "/shop/smartmaster", label: "Smart Master" },
    { href: "/shop/tomaz", label: "Tomaz" },
  ];

  const filters = [
    { value: "all", label: "All" },
    { value: "shirt", label: "Shirt" },
    { value: "trousers", label: "Trousers" },
  ];

  const filtered = products.filter((item) => {
    if (category === "all") return true;
    const name = (item.name || "").toLowerCase();
    if (category === "shirt") return name.includes("shirt") || name.includes("tee");
    if (category === "trousers") return name.includes("trouser") || name.includes("pant");
    return true;
  });
  const hasData = filtered.length > 0;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <p className="text-xs uppercase text-green-600 font-semibold">Catalog</p>
            <h1 className="text-4xl font-bold text-green-700">Smart Master</h1>
            <p className="text-gray-600">Smart Master casual and formal picks.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="border border-green-200 text-green-700 px-3 py-1 rounded-full hover:bg-green-50 text-sm"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {filters.map((f) => (
            <Link
              key={f.value}
              href={f.value === "all" ? "/shop/smartmaster" : `/shop/smartmaster?category=${f.value}`}
              className={`px-3 py-1 rounded-full text-sm border ${
                category === f.value
                  ? "bg-green-600 text-white border-green-600"
                  : "border-green-200 text-green-700 hover:bg-green-50"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
          {hasData ? (
            filtered.map((item, i) => (
              <div
                key={item.url || `${item.name || "item"}-${i}`}
                className="bg-white rounded-xl shadow hover:shadow-lg overflow-hidden border border-gray-100"
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name || "Product image"}
                    width={400}
                    height={300}
                    className="w-full h-52 object-cover"
                  />
                ) : (
                  <div className="w-full h-52 bg-gray-100 flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
                <div className="p-5 text-center">
                  <div className="text-xs uppercase text-green-600 font-semibold mb-1">Smart Master</div>
                  <h2 className="text-lg font-semibold line-clamp-2 min-h-[3rem]">{item.name || "Untitled"}</h2>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      View product
                    </a>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500">No Smart Master products available. Run the scraper to populate data.</div>
          )}
        </div>
      </div>
    </Layout>
  );
}
