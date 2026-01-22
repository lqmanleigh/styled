"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/user/wishlist";

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
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-white shadow">
        <img
          src="https://res.cloudinary.com/djsbnythn/image/upload/v1768718065/logo_bjkqh7.png"
          alt="Styled Logo"
          className="h-12 w-auto"
        />

        <nav className="flex gap-6 text-sm font-medium">
          <Link href="/">Home</Link>
          <Link href="/shop">Shop</Link>
        </nav>
      </header>

      {/* Login Section */}
      <section className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="bg-white p-10 rounded-2xl shadow-md w-full max-w-md text-center">
          <h2 className="text-3xl font-bold text-green-700 mb-4">
            Sign In
          </h2>

          <p className="text-gray-600 mb-6">
            This application supports <strong>Google Sign-In only</strong>.
            <br />
            Please sign in using your Google account.
          </p>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-3 border border-gray-300 py-3 rounded-lg transition ${
              loading
                ? "bg-gray-100 cursor-not-allowed"
                : "hover:bg-gray-100"
            }`}
          >
            <Image
              src="https://res.cloudinary.com/djsbnythn/image/upload/v1768718476/google_dlmora.png"
              alt="Google"
              width={20}
              height={20}
            />
            <span className="font-medium">
              {loading ? "Signing in..." : "Continue with Google"}
            </span>
          </button>

          <p className="text-sm text-gray-500 mt-6">
            By continuing, you agree to use Google authentication for access.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-6 text-center text-gray-500 border-t">
        © {new Date().getFullYear()} Styled — All rights reserved.
      </footer>
    </main>
  );
}
