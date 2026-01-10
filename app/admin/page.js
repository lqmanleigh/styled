"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [scrapeStatus, setScrapeStatus] = useState({ status: "loading", timestamp: null });
  const [scrapeRunning, setScrapeRunning] = useState("");
  const [scrapeMessage, setScrapeMessage] = useState("");
  const [selectedSpider, setSelectedSpider] = useState("all");

  const loadUsers = () => {
    return fetch("/api/admin/users")
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Failed to load users");
        setUsers(data.users || []);
      })
      .catch((err) => {
        setError(err?.message || "Failed to load users");
      });
  };

  useEffect(() => {
    if (status !== "authenticated") return;
    if (session?.user?.role !== "ADMIN") {
      setError("You do not have access to this page.");
      return;
    }
    loadUsers();
    fetch("/api/admin/scrape-status", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Failed to load scrape status");
        setScrapeStatus({
          status: data?.status || null,
          timestamp: data?.timestamp || null,
          source: data?.source || null,
          spiders: data?.spiders || {},
        });
      })
      .catch(() => {
        setScrapeStatus({ status: null, timestamp: null, source: null, spiders: {} });
      });
  }, [status, session]);

  const handleRunScrape = async (spider) => {
    setScrapeRunning(spider);
    setScrapeMessage("");
    try {
      const res = await fetch("/api/admin/scrape-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spider }), // accepted but ignored by scrape-all
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to trigger scrape");
      setScrapeMessage(`Scrape started and completed.`);
    } catch (err) {
      setScrapeMessage(err?.message || "Failed to trigger scrape");
    } finally {
      setScrapeRunning("");
    }
  };

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return null;

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-green-50 to-gray-50 text-gray-900 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center border border-gray-100">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600 font-semibold text-lg mb-2">{error}</p>
          <p className="text-gray-600 text-sm mb-6">You don't have the necessary permissions to access this page.</p>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg hover:opacity-95 transition-opacity font-medium shadow-sm"
          >
            Sign out
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-gray-50 to-blue-50 text-gray-900 px-4 py-8 md:px-8 md:py-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-green-600 font-bold">Administration Panel</p>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-1">Dashboard Overview</h1>
              </div>
            </div>
            <p className="text-sm text-gray-600 max-w-2xl">Monitor user activity, manage data pipelines, and oversee platform operations</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{session.user?.email}</p>
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                {session.user?.role || "USER"}
              </span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-colors shadow-sm hover:shadow"
              type="button"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Scrape Controls */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Data Operations</p>
                <h2 className="text-2xl font-bold text-gray-900">Scrape Products</h2>
                <p className="text-sm text-gray-600">Run spiders individually or all at once</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedSpider}
                onChange={(e) => setSelectedSpider(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                disabled={!!scrapeRunning}
              >
                <option value="all">Run All</option>
                <option value="aegis" disabled>Run All (only)</option>
                <option value="smartmaster" disabled>Run All (only)</option>
                <option value="tomaz" disabled>Run All (only)</option>
              </select>
              <button
                onClick={() => handleRunScrape(selectedSpider)}
                disabled={!!scrapeRunning}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${
                  scrapeRunning
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
                }`}
                type="button"
              >
                {scrapeRunning ? `Running ${scrapeRunning}...` : "Run"}
              </button>
            </div>
            {scrapeMessage && (
              <div className="text-sm text-gray-700">{scrapeMessage}</div>
            )}
          </div>
        </div>

        {/* Users Table Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">User Management</p>
                <h2 className="text-2xl font-bold text-gray-900">Registered Users</h2>
                <p className="text-sm text-gray-600">Overview of all platform users and their activity</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-sm font-semibold text-gray-900">{users.length}</span>
                  <span className="text-sm text-gray-600 ml-2">total users</span>
                </div>
                <button
                  onClick={loadUsers}
                  className="p-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                  title="Refresh users"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">User Profile</th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Role</th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Activity</th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900">{u.name || "Unnamed User"}</p>
                          <p className="text-sm text-gray-600">{u.email || "No email"}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">{u._count.wishlistItems || 0}</div>
                            <div className="text-xs text-gray-600">Wishlists</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">{u._count.events || 0}</div>
                            <div className="text-xs text-gray-600">Events</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">{u._count.accounts || 0}</div>
                            <div className="text-xs text-gray-600">Accounts</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {u.createdAt ? new Date(u.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {users.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 2H15" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium">No users found</p>
                <p className="text-gray-500 text-sm mt-1">Try refreshing or check your connection</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
