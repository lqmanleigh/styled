import Layout from "../components/Layout";
import Link from "next/link";
import Image from "next/image";

const brands = [
  {
    name: "Aegis 601",
    desc: "AEGIS601 is a Malaysian streetwear label that merges modern urban aesthetics with local cultural nuance. Since its founding, it has gained momentum for delivering high-quality, thoughtfully designed pieces — from bold denim and statement tees to unique capsule collections. Collaborating with regional peers and actively engaging with a growing community, AEGIS601 aims to “forge the next artifact”: garments that resonate beyond fashion trends and reflect identity, creativity, and style.",
    href: "/shop/aegis",
    img: "/images/shop1.png",
  },
  {
    name: "Smart Master",
    desc: "Smart Master is a Malaysian men’s-wear label that blends decades of tailoring heritage with modern style — offering shirts and trousers, in both ready-made and tailor-made form. Whether for formal occasions, work, or smart-casual wear, Smart Master delivers quality craftsmanship, fine fits, and timeless elegance — giving every man the confidence to dress sharp and suitable for any occasion.",
    href: "/shop/smartmaster",
    img: "/images/shop2.png",
  },
  {
    name: "Tomaz",
    desc: "Tomaz is widely known in Malaysia for value-driven men’s fashion, and their blazer collection is one of the standout categories in their modern menswear lineup. Bringing together classic tailoring and accessible pricing, Tomaz blazers are designed for men who want to look sharp without overspending.",
    href: "/shop/tomaz",
    img: "/images/shop3.png",
  },
];

export default function ShopPage() {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center">
          <p className="text-xs uppercase text-green-600 font-semibold">Catalog</p>
          <h1 className="text-4xl font-bold text-green-700">Shop by Brand</h1>
          <p className="text-gray-600 mt-2">Discover the collections and shop their catalogs.</p>
        </div>

        <div className="space-y-6">
          {brands.map((brand, i) => (
            <div
              key={brand.name + i}
              className="bg-white rounded-2xl shadow hover:shadow-lg overflow-hidden border border-gray-100 flex flex-col md:flex-row"
            >
              <div className="md:w-1/3 min-h-full">
                <Image
                  src={brand.img}
                  alt={brand.name}
                  width={800}
                  height={600}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 p-6 flex flex-col justify-center text-left space-y-3">
                <div className="text-xs uppercase text-green-600 font-semibold">Brand</div>
                <h2 className="text-2xl font-semibold">{brand.name}</h2>
                <p className="text-gray-600 leading-relaxed">{brand.desc}</p>
                <div>
                  <Link
                    href={brand.href}
                    className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    View catalog
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
