"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import prisma from "@/lib/prisma";

async function fetchUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: { wishlistItems: true, events: true, accounts: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status !== "authenticated") return;
    if (session?.user?.role !== "ADMIN") {
      setError("You do not have access to this page.");
      return;
    }
    fetchUsers()
      .then(setUsers)
      .catch((err) => {
        setError(err?.message || "Failed to load users");
      });
  }, [status, session]);

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return null;

  if (error) {
    return (
      <main className="min-h-screen bg-green-50 text-gray-800 flex items-center justify-center px-6">
        <div className="bg-white rounded-xl shadow p-6 max-w-xl w-full text-center">
          <p className="text-red-600 font-semibold">{error}</p>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="mt-4 text-sm px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-green-50 min-h-screen text-gray-800 px-8 py-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase text-green-600 font-semibold">Admin</p>
            <h1 className="text-4xl font-bold text-green-700">Dashboard</h1>
          </div>
          <div className="text-sm text-gray-600">
            Signed in as {session.user?.email} ({session.user?.role || "USER"})
          </div>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-100 p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">Users</h2>
            <span className="text-sm text-gray-500">{users.length} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2 pr-4">Wishlists</th>
                  <th className="py-2 pr-4">Events</th>
                  <th className="py-2 pr-4">Accounts</th>
                  <th className="py-2 pr-4">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b last:border-b-0">
                    <td className="py-2 pr-4">{u.name || "—"}</td>
                    <td className="py-2 pr-4">{u.email || "—"}</td>
                    <td className="py-2 pr-4">
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 border border-green-200">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2 pr-4">{u._count.wishlistItems}</td>
                    <td className="py-2 pr-4">{u._count.events}</td>
                    <td className="py-2 pr-4">{u._count.accounts}</td>
                    <td className="py-2 pr-4">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
