"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("admin-credentials", {
        redirect: false,
        username,
        password,
        callbackUrl: "/admin",
      });
      if (res?.error) throw new Error(res.error);
      // Prefer router navigation to avoid full reload
      router.push(res?.url || "/admin");
    } catch (err) {
      setError(err?.message || "Login failed");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-green-50 flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full border border-gray-100">
        <p className="text-xs uppercase text-green-600 font-semibold mb-2">Admin</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Sign In</h1>
        <p className="text-sm text-gray-600 mb-6">
          Enter admin credentials to continue.
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm text-gray-700 block mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-green-100"
              required
            />
          </div>
          <div>
            <label className="text-sm text-gray-700 block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-green-100"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        {error && <p className="text-sm text-red-600 mt-3 text-center">{error}</p>}
      </div>
    </main>
  );
}
