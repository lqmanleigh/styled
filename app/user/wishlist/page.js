"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Layout from "../../components/Layout";

export default function UserWishlistPage() {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState([]);
  const [calendarStatus, setCalendarStatus] = useState("idle"); // idle | loading | connected | disconnected | error
  const [calendarError, setCalendarError] = useState("");
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistStatus, setWishlistStatus] = useState("idle"); // idle | loading | loaded | error
  const [wishlistError, setWishlistError] = useState("");

  useEffect(() => {
    if (status !== "authenticated") return;
    setCalendarStatus("loading");
    setCalendarError("");
    setWishlistStatus("loading");
    setWishlistError("");

    fetch("/api/wishlist")
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Failed to load wishlist");
        setWishlistItems(data.items || []);
        setWishlistStatus("loaded");
      })
      .catch((err) => {
        setWishlistStatus("error");
        setWishlistError(err.message || "Something went wrong");
      });

    fetch("/api/calendar/events")
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (res.status === 404) {
          setCalendarStatus("disconnected");
          setEvents([]);
          return;
        }
        if (!res.ok) {
          throw new Error(data?.error || "Failed to load calendar events");
        }
        setEvents(data.events || []);
        setCalendarStatus(data.connected ? "connected" : "disconnected");
      })
      .catch((err) => {
        setCalendarStatus("error");
        setCalendarError(err.message || "Something went wrong");
      });
  }, [status]);

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return null; // Middleware should have redirected already

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-3xl font-bold">Your Wishlist</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/api/google-calendar/auth"
            className="text-sm px-4 py-2 border border-green-600 text-green-700 rounded hover:bg-green-50"
          >
            {calendarStatus === "connected" ? "Reconnect Calendar" : "Connect Calendar"}
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-sm px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-3">Saved items</h2>
          {wishlistStatus === "loading" && <p className="text-gray-500">Loading wishlist…</p>}
          {wishlistStatus === "error" && (
            <p className="text-red-600 text-sm">Could not load wishlist: {wishlistError}</p>
          )}
          {wishlistStatus === "loaded" && wishlistItems.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-4">
              {wishlistItems.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    {item.product?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.product.image}
                        alt={item.product?.name || "Product image"}
                        className="w-16 h-16 object-cover rounded border"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded border border-dashed flex items-center justify-center text-gray-300 text-xs">
                        No image
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="font-semibold">
                        {item.product?.name || item.label || "Wishlist item"}
                      </span>
                      {item.product?.brand && (
                        <span className="text-xs text-gray-500">{item.product.brand}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    {item.product?.price ? (
                      <span className="text-green-600 font-semibold">
                        ${Number(item.product.price).toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">Saved</span>
                    )}
                    <div className="flex items-center gap-3">
                      {item.product?.url && (
                        <a
                          href={item.product.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-green-700 hover:underline"
                        >
                          View
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const res = await fetch(`/api/wishlist?id=${item.id}`, { method: "DELETE" });
                            const data = await res.json().catch(() => ({}));
                            if (!res.ok) throw new Error(data?.error || "Failed to remove");
                            setWishlistItems((prev) => prev.filter((w) => w.id !== item.id));
                          } catch (err) {
                            alert(err?.message || "Failed to remove item");
                          }
                        }}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {wishlistStatus === "loaded" && wishlistItems.length === 0 && (
            <p className="text-gray-500">Your wishlist is empty.</p>
          )}
        </div>

        <div className="bg-white rounded shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Your Calendar</h2>
            <span className="text-xs text-gray-500 uppercase tracking-wide">
              {calendarStatus === "connected"
                ? "Connected"
                : calendarStatus === "loading"
                ? "Loading..."
                : calendarStatus === "error"
                ? "Error"
                : "Not connected"}
            </span>
          </div>
          {calendarStatus === "loading" && <p className="text-gray-500">Fetching events…</p>}
          {calendarStatus === "error" && (
            <p className="text-red-600 text-sm">Could not load events: {calendarError}</p>
          )}
          {calendarStatus === "disconnected" && (
            <p className="text-gray-500 text-sm">
              Connect your Google Calendar to see upcoming occasions alongside your wishlist.
            </p>
          )}
          {calendarStatus === "connected" && events.length === 0 && (
            <p className="text-gray-500 text-sm">No upcoming events found.</p>
          )}
          {calendarStatus === "connected" && events.length > 0 && (
            <ul className="space-y-3">
              {events.map((event) => (
                <li key={event.id} className="border rounded p-3">
                  <p className="font-semibold">{event.summary}</p>
                  <p className="text-sm text-gray-600">
                    {event.start ? new Date(event.start).toLocaleString() : "No start"}
                  </p>
                  {event.location && <p className="text-sm text-gray-500">{event.location}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  );
}
