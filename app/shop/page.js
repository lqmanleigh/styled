import Layout from "../components/Layout";
import Link from "next/link";
import Image from "next/image";

const brands = [
  {
    name: "Aegis 601",
    desc: "AEGIS601 is a Malaysian streetwear label that merges modern urban aesthetics with local cultural nuance. Since its founding, it has gained momentum for delivering high-quality, thoughtfully designed pieces — from bold denim and statement tees to unique capsule collections. Collaborating with regional peers and actively engaging with a growing community, AEGIS601 aims to “forge the next artifact”: garments that resonate beyond fashion trends and reflect identity, creativity, and style.",
    href: "/shop/aegis",
    img: "https://res.cloudinary.com/djsbnythn/image/upload/v1768791162/aegis_tlnevx.jpg",
    style: "Streetwear",
    styleColor: "bg-purple-100 text-purple-800 border-purple-200",
    styleIcon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    name: "Smart Master",
    desc: "Smart Master is a Malaysian men's-wear label that blends decades of tailoring heritage with modern style — offering shirts and trousers, in both ready-made and tailor-made form. Whether for formal occasions, work, or smart-casual wear, Smart Master delivers quality craftsmanship, fine fits, and timeless elegance — giving every man the confidence to dress sharp and suitable for any occasion.",
    href: "/shop/smartmaster",
    img: "https://res.cloudinary.com/djsbnythn/image/upload/v1768791321/smartmaster_usnuqm.webp",
    style: "Casual & Smart Casual",
    styleColor: "bg-blue-100 text-blue-800 border-blue-200",
    styleIcon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    name: "Tomaz",
    desc: "Tomaz is widely known in Malaysia for value-driven men's fashion, and their blazer collection is one of the standout categories in their modern menswear lineup. Bringing together classic tailoring and accessible pricing, Tomaz blazers are designed for men who want to look sharp without overspending.",
    href: "/shop/tomaz",
    img: "https://res.cloudinary.com/djsbnythn/image/upload/v1768791172/tomaz_kdminf.jpg",
    style: "Formal & Business Wear",
    styleColor: "bg-gray-100 text-gray-800 border-gray-200",
    styleIcon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export default function ShopPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Header Section */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-100 rounded-full border border-green-200">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              <p className="text-sm uppercase text-green-700 font-bold tracking-widest">Brand Catalog</p>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
              Discover Exclusive Brands
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Immerse yourself in Malaysia's premier fashion collections. Each brand represents exceptional craftsmanship, innovative design, and timeless style.
            </p>
          </div>

          {/* Brands Grid - Side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {brands.map((brand, i) => (
              <div
                key={brand.name}
                className="group bg-white rounded-3xl shadow-2xl hover:shadow-3xl overflow-hidden border border-gray-200 transition-all duration-500 hover:-translate-y-2 flex flex-col"
              >
                {/* Image Container - Top */}
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={brand.img}
                    alt={brand.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    priority={i === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  <div className="absolute top-6 left-6">
                    <div className="flex flex-col gap-2">
                      <span className="px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-xs font-bold text-gray-800">
                        Featured
                      </span>
                      <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center shadow-xl">
                        <span className="text-white font-bold text-lg">{i + 1}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Container - Bottom */}
                <div className="flex-1 p-8 flex flex-col">
                  <div className="space-y-6">
                    {/* Brand Header */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-6 bg-green-500 rounded-full"></div>
                          <p className="text-xs uppercase text-green-600 font-semibold tracking-wider">Premium Brand</p>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${brand.styleColor} text-xs font-semibold`}>
                          {brand.styleIcon}
                          <span>{brand.style}</span>
                        </div>
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900 leading-tight">
                        {brand.name}
                      </h2>
                    </div>

                    {/* Style Description */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                            {brand.styleIcon}
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{brand.style}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {brand.style === "Streetwear" && "Urban-inspired fashion with bold designs and cultural influences."}
                            {brand.style === "Casual & Smart Casual" && "Versatile styles perfect for everyday wear and relaxed occasions."}
                            {brand.style === "Formal & Business Wear" && "Tailored elegance for professional settings and formal events."}
                          </p>
                        </div>
                      </div>
                    </div>

                    

                    {/* CTA Button */}
                    <div className="mt-auto pt-6">
                      <Link
                        href={brand.href}
                        className="group/btn w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-xl hover:opacity-95 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                      >
                        <span>Browse {brand.style} Collection</span>
                        <svg 
                          className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Style Guide Section */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl border border-gray-200 p-8 md:p-10 shadow-xl">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-900">Find Your Style</h3>
              <p className="text-gray-600 mt-2">Explore different fashion categories to match your personality and occasion</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">Streetwear</h4>
                </div>
                <p className="text-gray-600">Bold, urban-inspired fashion that makes a statement. Perfect for casual outings, music events, and expressing individuality.</p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">Casual & Smart Casual</h4>
                </div>
                <p className="text-gray-600">Versatile styles for everyday wear. Ideal for office settings, weekend outings, and relaxed social gatherings.</p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">Formal & Business</h4>
                </div>
                <p className="text-gray-600">Elegant and professional attire for business meetings, formal events, and occasions that require sophisticated dressing.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}