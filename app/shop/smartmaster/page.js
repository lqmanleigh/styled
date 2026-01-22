import Layout from "../../components/Layout";
import Image from "next/image";
import Link from "next/link";
import AddToWishlistButton from "../../components/AddToWishlistButton";
import prisma from "@/lib/prisma";

async function loadProducts() {
  return prisma.product.findMany({
    where: { brand: "Smart Master" },
    orderBy: { name: "asc" },
  });
}

export default async function SmartMasterShopPage({ searchParams }) {
  const params = await searchParams;
  const products = await loadProducts();
  const nonFashion = products.filter((p) => p.isFashion === false);
  const visible = products.filter((p) => p.isFashion !== false);
  const lastScraped =
    products.reduce((latest, item) => {
      const dtSource = item.scrapedAt || item.createdAt;
      const dt = dtSource ? new Date(dtSource) : null;
      return dt && (!latest || dt > latest) ? dt : latest;
    }, null) || null;
  const category = (params?.category || "all").toLowerCase();
  const navLinks = [
    { href: "/shop/aegis", label: "Aegis", active: false },
    { href: "/shop/smartmaster", label: "Smart Master", active: true },
    { href: "/shop/tomaz", label: "Tomaz", active: false },
  ];

  const filters = [
    { value: "all", label: "All Products", count: visible.length },
    { value: "shirt", label: "Shirts", count: visible.filter(p => (p.name || "").toLowerCase().includes("shirt") || (p.name || "").toLowerCase().includes("tee")).length },
    { value: "trousers", label: "Trousers", count: visible.filter(p => (p.name || "").toLowerCase().includes("trouser") || (p.name || "").toLowerCase().includes("pant")).length },
  ];

  const filtered = visible.filter((item) => {
    if (category === "all") return true;
    const name = (item.name || "").toLowerCase();
    if (category === "shirt") return name.includes("shirt") || name.includes("tee");
    if (category === "trousers") return name.includes("trouser") || name.includes("pant");
    return true;
  });
  const hasData = filtered.length > 0;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-100 rounded-full border border-blue-200">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <p className="text-xs uppercase text-blue-700 font-semibold tracking-wider">Casual & Smart Casual Collection</p>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Smart Master Collection
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl">
                Discover timeless casual and smart-casual wear that blends tailoring heritage with modern style. Perfect for any occasion.
              </p>
              {lastScraped && (
                <p className="text-sm text-gray-500">
                  Last scraped: {lastScraped.toLocaleString()}
                </p>
              )}
            </div>
            
            {/* Brand Navigation */}
            <div className="flex flex-wrap gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-300 ${
                    link.active
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600 shadow-lg'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                  <p className="text-sm text-gray-600">Total Products</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">Versatile</p>
                  <p className="text-sm text-gray-600">Any Occasion Wear</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Filter Collection</h2>
                <p className="text-gray-600">Browse by product category</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span>Showing {filtered.length} of {products.length} items</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {filters.map((f) => (
                <Link
                  key={f.value}
                  href={f.value === "all" ? "/shop/smartmaster" : `/shop/smartmaster?category=${f.value}`}
                  className={`group flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-300 ${
                    category === f.value
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600 shadow-lg'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow'
                  }`}
                >
                  <span>{f.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    category === f.value 
                      ? 'bg-white/30' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {f.count}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900">
                {category === "all" ? "All Products" : 
                 category === "shirt" ? "Shirt Collection" : 
                 "Trouser Collection"}
              </h2>
              {category !== "all" && (
                <Link 
                  href="/shop/smartmaster"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  Clear filter
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Link>
              )}
            </div>

            {hasData ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((item, i) => (
                  <div
                    key={item.url || `${item.name || "item"}-${i}`}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden border border-gray-100 transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Image Container */}
                    <div className="relative h-64 overflow-hidden">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name || "Product image"}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute top-4 right-4">
                        <div className="flex flex-col gap-2">
                          <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-800">
                            Smart Master
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content Container */}
                    <div className="p-5 space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-xs uppercase text-blue-600 font-semibold">Casual Wear</span>
                          </div>
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 line-clamp-2 min-h-[3rem]">
                          {item.name || "Untitled Product"}
                        </h2>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-3">
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="group/btn w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-xl hover:opacity-95 transition-all duration-300 font-medium shadow-sm hover:shadow-md"
                          >
                            <span>View Product</span>
                            <svg 
                              className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </a>
                        )}
                        <AddToWishlistButton 
                          productId={item.id} 
                          label={item.name || "Smart Master item"}
                          className="w-full px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors hover:shadow flex items-center justify-center gap-2"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {category === "all" ? "No Products Available" : "No Products Found"}
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {category === "all" 
                    ? "The Smart Master collection is currently empty. Please run the scraper in the admin panel to populate the data."
                    : `No ${category} found in the Smart Master collection. Try a different category.`
                  }
                </p>
                {category !== "all" && (
                  <Link 
                    href="/shop/smartmaster"
                    className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium"
                  >
                    View All Products
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Non-fashion (filtered out) section */}
          {nonFashion.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Flagged as Not Fashion</h2>
              <p className="text-sm text-gray-600">Items automatically flagged as not fashion content.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {nonFashion.map((item, i) => (
                  <div
                    key={item.url || `${item.name || "item"}-nonfashion-${i}`}
                    className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm"
                  >
                    <div className="relative h-48 mb-3 overflow-hidden rounded-xl bg-gray-50 border">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name || "Product image"}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                          No image
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">
                      {item.name || "Untitled item"}
                    </p>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900 mt-3"
                      >
                        View product
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}
