"use client";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="bg-green-50 min-h-screen text-gray-800">
      {/* Navbar */}
      <header className="flex items-center justify-between px-8 py-4 bg-white shadow">
        <h1 className="text-2xl font-bold text-green-600">Styled</h1>

        <div className="flex items-center gap-2 w-1/3">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none"
          />
          <button className="bg-green-600 text-white px-4 py-2 rounded-r-lg hover:bg-green-700">
            Search
          </button>
        </div>

        <nav className="flex gap-6 text-sm font-medium">
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/shop">Shop</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/wishlist" className="font-semibold text-green-600">Wishlist</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-10 py-16 bg-gradient-to-br from-green-100 via-white to-green-50">
        <div className="md:w-1/2">
          <h2 className="text-5xl font-extrabold mb-4 text-green-700 leading-tight">
            Discover Fashion,
            <br />
            Personalized for You
          </h2>
          <p className="text-gray-600 mb-6 text-lg">
            Explore top styles curated from multiple online stores, powered by
            AI and real-time web data. Shop smart, shop contextually.
          </p>
        </div>

        <div className="md:w-1/2 mt-8 md:mt-0 flex justify-center">
          <Image
            src="/images/fashion-banner.png"
            alt="Fashion Banner"
            width={400}
            height={300}
            className="rounded-xl shadow-lg"
          />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-10 py-16 bg-white text-center">
        <h3 className="text-3xl font-bold mb-10 text-green-700">How Styled Works</h3>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Web Data Integration",
              desc: "We collect trending fashion data from multiple e-commerce platforms in real time.",
              icon: "Web",
            },
            {
              title: "AI-Powered Insights",
              desc: "We analyze popularity, reviews, and seasonal trends to recommend what fits you best.",
              icon: "AI",
            },
            {
              title: "Unified Experience",
              desc: "Discover products from different brands — all in one curated place.",
              icon: "UX",
            },
          ].map((step, i) => (
            <div key={i} className="bg-green-50 p-8 rounded-2xl shadow hover:shadow-lg transition-all">
              <div className="text-5xl mb-4">{step.icon}</div>
              <h4 className="text-xl font-semibold mb-2">{step.title}</h4>
              <p className="text-gray-600">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Now Section */}
      <section className="px-10 py-16 bg-green-50">
        <h3 className="text-3xl font-bold mb-10 text-center text-green-700">Trending Now</h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {[
            { name: "Bayang Jeans", img: "/images/jeans.png", price: "$49" },
            { name: "Silky Dress", img: "/images/dress.png", price: "$79" },
            { name: "Urban Hoodie", img: "/images/hoodie.png", price: "$65" },
            { name: "Leather Bag", img: "/images/bag.png", price: "$89" },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl shadow hover:shadow-lg transition-all overflow-hidden">
              <Image
                src={item.img}
                alt={item.name}
                width={400}
                height={300}
                className="w-full h-60 object-cover"
              />
              <div className="p-4">
                <h4 className="font-semibold">{item.name}</h4>
                <p className="text-green-600 font-bold">{item.price}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call To Action */}
      <section className="text-center py-16 bg-gradient-to-r from-green-600 to-green-500 text-white">
        <h3 className="text-3xl font-bold mb-4">Ready to Explore Contextual Fashion?</h3>
        <p className="mb-6">Join thousands of users discovering smarter fashion recommendations daily.</p>
        <Link href="/register" className="bg-white text-green-700 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all">Get Started</Link>
      </section>

      {/* Footer */}
      <footer className="bg-white py-6 text-center text-gray-500 border-t">(c) {new Date().getFullYear()} Styled - All rights reserved.</footer>
    </main>
  );
}


