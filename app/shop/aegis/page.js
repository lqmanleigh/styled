import Layout from "../../components/Layout";
import Image from "next/image";
import Link from "next/link";
import AddToWishlistButton from "../../components/AddToWishlistButton";
import prisma from "@/lib/prisma";

async function loadProducts() {
  return prisma.product.findMany({
    where: { brand: "Aegis" },
    orderBy: { name: "asc" },
  });
}

export default async function AegisShopPage() {
  const products = await loadProducts();
  const nonFashion = products.filter((p) => p.isFashion === false);
  const visible = products.filter((p) => p.isFashion !== false);
  const hasData = visible.length > 0;
  const lastScraped =
    products.reduce((latest, item) => {
      const dtSource = item.scrapedAt || item.createdAt;
      const dt = dtSource ? new Date(dtSource) : null;
      return dt && (!latest || dt > latest) ? dt : latest;
    }, null) || null;
  const navLinks = [
    { href: "/shop/aegis", label: "Aegis", active: true },
    { href: "/shop/smartmaster", label: "Smart Master", active: false },
    { href: "/shop/tomaz", label: "Tomaz", active: false },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-purple-100 rounded-full border border-purple-200">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <p className="text-xs uppercase text-purple-700 font-semibold tracking-wider">Streetwear Collection</p>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Aegis 601 Collection
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl">
                Discover bold streetwear that merges urban aesthetics with cultural nuance. Each piece is designed to make a statement and reflect identity.
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
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white border-purple-600 shadow-lg'
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
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{visible.length}</p>
                  <p className="text-sm text-gray-600">Products Available</p>
                </div>
              </div>
            </div>
            
            
          </div>

          {/* Products Grid */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <span>{visible.length} items</span>
              </div>
            </div>

            {hasData ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {visible.map((item, i) => (
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
                            Aegis
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content Container */}
                    <div className="p-5 space-y-4">

                      {/* Action Buttons */}
                      <div className="space-y-3">
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="group/btn w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-3 rounded-xl hover:opacity-95 transition-all duration-300 font-medium shadow-sm hover:shadow-md"
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
                          label={item.name || "Aegis item"}
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
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Products Available</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  The Aegis collection is currently empty. Please run the scraper in the admin panel to populate the data.
                </p>
              </div>
            )}
          </div>

          {/* Non-fashion (filtered out) section */}
          {nonFashion.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Flagged as Not Fashion</h2>
              <p className="text-sm text-gray-600">
                Items automatically flagged as not fashion content.
              </p>
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
