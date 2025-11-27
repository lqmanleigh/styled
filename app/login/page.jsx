"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/user/wishlist";

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Email/password login is not implemented yet.");
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signIn("google", { callbackUrl });
    } catch (error) {
      console.error("Google sign-in error:", error);
      alert("Failed to sign in with Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-green-50 min-h-screen text-gray-800 flex flex-col">
      <header className="flex items-center justify-between px-8 py-4 bg-white shadow">
        <h1 className="text-2xl font-bold text-green-600">Styled</h1>

        <div className="flex items-center gap-2 w-1/3">
          <input type="text" placeholder="Search products..." className="w-full border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none" />
          <button className="bg-green-600 text-white px-4 py-2 rounded-r-lg hover:bg-green-700">Search</button>
        </div>

        <nav className="flex gap-6 text-sm font-medium">
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/shop">Shop</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/wishlist" className="font-semibold text-green-600">Wishlist</Link>
        </nav>
      </header>

      <section className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="bg-white p-10 rounded-2xl shadow-md w-full max-w-md">
          <h2 className="text-3xl font-bold text-green-700 text-center mb-6">Welcome Back</h2>
          <p className="text-center text-gray-600 mb-8">Sign in to access personalized fashion recommendations.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="********" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none" />
            </div>

            <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition">Sign In</button>
          </form>

          <div className="my-6 flex items-center justify-center gap-2 text-gray-400">
            <span className="w-1/4 border-t"></span>
            <span className="text-sm">or</span>
            <span className="w-1/4 border-t"></span>
          </div>

          <button onClick={handleGoogleLogin} disabled={loading} className={`w-full flex items-center justify-center gap-3 border border-gray-300 py-3 rounded-lg transition ${loading ? "bg-gray-100 cursor-not-allowed" : "hover:bg-gray-100"}`}>
            <Image src="/images/google-icon.png" alt="Google" width={20} height={20} />
            <span>{loading ? "Signing in..." : "Continue with Google"}</span>
          </button>

          <p className="text-center text-sm text-gray-600 mt-6">
            Don’t have an account? <Link href="/register" className="text-green-600 font-semibold hover:underline">Sign Up</Link>
          </p>
        </div>
      </section>

      <footer className="bg-white py-6 text-center text-gray-500 border-t">© {new Date().getFullYear()} Styled — All rights reserved.</footer>
    </main>
  );
}

