"use client";
import Layout from "../components/Layout";
import Image from "next/image";

export default function ShopPage() {
  const shops = [
    { name: "Zara", desc: "Trendy urban wear", img: "/images/shop1.png" },
    { name: "Uniqlo", desc: "Minimalist essentials", img: "/images/shop2.png" },
    { name: "H&M", desc: "Everyday fashion", img: "/images/shop3.png" },
  ];

  return (
    <Layout>
      <h1 className="text-4xl font-bold text-green-700 mb-8">Shop from Top Brands</h1>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
        {shops.map((shop, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow hover:shadow-lg p-6 text-center"
          >
            <Image
              src={shop.img}
              alt={shop.name}
              width={150}
              height={150}
              className="mx-auto mb-4 rounded-lg"
            />
            <h2 className="text-xl font-semibold">{shop.name}</h2>
            <p className="text-gray-600 mt-2">{shop.desc}</p>
            <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              Explore
            </button>
          </div>
        ))}
      </div>
    </Layout>
  );
}
