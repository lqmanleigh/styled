"use client";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ContactPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/user/contact");
    }
  }, [status, router]);

  return (
    <main className="flex flex-col min-h-screen bg-green-50 text-gray-800">
      <div className="flex-grow flex flex-col items-center justify-center text-center px-6">
        <Image src="/images/login-required.png" alt="Sign In Required" width={180} height={180} className="mb-6 opacity-90" />
        <h1 className="text-3xl font-bold mb-3">Access Restricted</h1>
        <p className="text-gray-600 mb-6 max-w-md">You need to sign in to contact our support team. Join our community and get personalized fashion help!</p>
        <div className="flex gap-4">
          <Link href="/login?callbackUrl=/user/contact" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">Sign In</Link>
          <Link href="/shop" className="border border-green-600 text-green-700 px-6 py-3 rounded-lg hover:bg-green-100">Continue as Guest</Link>
        </div>
      </div>
      <footer className="bg-white py-6 text-center text-gray-500 border-t">(c) {new Date().getFullYear()} Styled - All rights reserved.</footer>
    </main>
  );
}
