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
        <img
          src="https://res.cloudinary.com/djsbnythn/image/upload/v1768718065/logo_bjkqh7.png"
          alt="Styled Logo"
          className="h-12 w-auto"
        />


        <nav className="flex gap-6 text-sm font-medium">
          <Link href="/">Home</Link>
          <Link href="/shop">Shop</Link>
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
