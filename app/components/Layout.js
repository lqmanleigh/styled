"use client";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";

export default function Layout({ children }) {
  const { status } = useSession();
  const wishlistHref = status === "unauthenticated" ? "/wishlist" : "/user/wishlist";
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
          <Link href={wishlistHref} className="font-semibold text-green-600">Wishlist</Link>
        </nav>
      </header>

      {/* Main Page Content */}
      <div className="px-8 py-10">
        <div className="max-w-7xl mx-auto">{children}</div>
      </div>

      {/* Footer */}
      <footer className="bg-white py-6 text-center text-gray-500 border-t mt-10">
        © {new Date().getFullYear()} Styled — All rights reserved.
      </footer>
    </main>
  );
}
