"use client";
import { useSession, signOut } from "next-auth/react";
import Layout from "../../components/Layout";

export default function UserWishlistPage() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return null; // Middleware should have redirected already

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Your Wishlist</h1>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-sm px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
        >
          Sign out
        </button>
      </div>
      {session?.user?.wishlist?.length > 0 ? (
        <ul className="space-y-4">
          {session.user.wishlist.map((item, idx) => (
            <li
              key={idx}
              className="flex items-center justify-between p-4 bg-white rounded shadow"
            >
              <span>{item.name}</span>
              <span className="text-green-600 font-semibold">${item.price}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">Your wishlist is empty.</p>
      )}
    </Layout>
  );
}
