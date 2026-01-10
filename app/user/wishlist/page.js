"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Layout from "../../components/Layout";

const makeIcon = (glyph) => ({ className = "", size = 16 }) => (
  <span className={className} style={{ fontSize: size }} aria-hidden="true">
    {glyph}
  </span>
);

const Calendar = makeIcon("📆");
const CalendarIcon = Calendar;
const Heart = makeIcon("❤️");
const LogOut = makeIcon("↩");
const ExternalLink = makeIcon("🔗");
const Trash2 = makeIcon("🗑️");
const Sparkles = makeIcon("✨");

export default function UserWishlistPage() {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState([]);
  const [calendarStatus, setCalendarStatus] = useState("idle");
  const [calendarError, setCalendarError] = useState("");
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistStatus, setWishlistStatus] = useState("idle");
  const [wishlistError, setWishlistError] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [recStatus, setRecStatus] = useState("idle");

  useEffect(() => {
    if (status !== "authenticated") return;
    
    setCalendarStatus("loading");
    setWishlistStatus("loading");
    
    // Fetch wishlist
    fetch("/api/wishlist")
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Failed to load wishlist");
        setWishlistItems(data.items || []);
        setWishlistStatus("loaded");
      })
      .catch((err) => {
        setWishlistStatus("error");
        setWishlistError(err.message);
      });

    // Fetch calendar events
    fetch("/api/calendar/events")
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (res.status === 404) {
          setCalendarStatus("disconnected");
          setEvents([]);
          return;
        }
        if (!res.ok) throw new Error(data?.error || "Failed to load calendar events");
        setEvents(data.events || []);
        setCalendarStatus(data.connected ? "connected" : "disconnected");
      })
      .catch((err) => {
        setCalendarStatus("error");
        setCalendarError(err.message);
      });
  }, [status]);

  useEffect(() => {
    if (events.length === 0) return;
    setRecStatus("loading");

    const formalKeywords = ["interview", "corporate", "business", "wedding", "ceremony", "conference", "presentation", "exam", "award", "meeting"];
    const casualKeywords = ["outing", "shopping", "gathering", "hangout"];
    const streetKeywords = ["social", "concert", "fashion", "content", "shoot"];

    const classify = (text) => {
      const lower = (text || "").toLowerCase();
      if (formalKeywords.some((k) => lower.includes(k))) return "formal";
      if (casualKeywords.some((k) => lower.includes(k))) return "casual";
      if (streetKeywords.some((k) => lower.includes(k))) return "streetwear";
      return null;
    };

    fetch("/api/products")
      .then((res) => res.json())
      .then((products) => {
        const productList = Array.isArray(products) ? products : [];
        const recs = events.map((ev) => {
          const category = classify(ev.summary);
          const take = category === "formal" ? 3 : category === "casual" ? 2 : category === "streetwear" ? 1 : 2;
          const matches = category
            ? productList.filter((p) => p.category && p.category.toLowerCase() === category)
            : [];
          return {
            eventId: ev.id,
            title: ev.summary || "Untitled Event",
            start: ev.start || null,
            category,
            items: matches.slice(0, take),
          };
        });
        setRecommendations(recs);
        setRecStatus("ready");
      })
      .catch(() => setRecStatus("error"));
  }, [events]);

  const removeWishlistItem = async (id) => {
    try {
      const res = await fetch(`/api/wishlist?id=${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to remove");
      setWishlistItems((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      alert(err?.message || "Failed to remove item");
    }
  };

  if (status === "loading") {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </Layout>
    );
  }

  if (!session) return null;

  const formalRecs = recommendations.filter((r) => r.category === "formal");
  const casualRecs = recommendations.filter((r) => r.category === "casual");
  const streetRecs = recommendations.filter((r) => r.category === "streetwear");

  const StatusBadge = ({ status }) => {
    const config = {
      connected: { label: "Connected", color: "bg-green-100 text-green-800" },
      disconnected: { label: "Not Connected", color: "bg-gray-100 text-gray-800" },
      loading: { label: "Loading", color: "bg-blue-100 text-blue-800" },
      error: { label: "Error", color: "bg-red-100 text-red-800" },
      idle: { label: "Idle", color: "bg-gray-100 text-gray-800" },
    };
    
    const { label, color } = config[status] || config.idle;
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>{label}</span>;
  };

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-600 mt-2">Manage your saved items and calendar-based recommendations</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/api/google-calendar/auth"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                calendarStatus === "connected"
                  ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                  : "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
              }`}
            >
              <CalendarIcon size={16} />
              {calendarStatus === "connected" ? "Reconnect Calendar" : "Connect Calendar"}
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Wishlist Items</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{wishlistItems.length}</p>
              </div>
              <Heart className="text-red-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Calendar Events</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{events.length}</p>
              </div>
              <Calendar className="text-blue-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Recommendations</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{recommendations.reduce((acc, rec) => acc + rec.items.length, 0)}</p>
              </div>
              <Sparkles className="text-purple-500" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wishlist Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Saved Items</h2>
                <p className="text-sm text-gray-600 mt-1">Products you've added to your wishlist</p>
              </div>
              <StatusBadge status={wishlistStatus} />
            </div>

            {wishlistStatus === "loading" && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            )}

            {wishlistStatus === "error" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">Could not load wishlist: {wishlistError}</p>
              </div>
            )}

            {wishlistStatus === "loaded" && wishlistItems.length > 0 ? (
              <div className="grid gap-4">
                {wishlistItems.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                    <div className="flex items-start gap-4">
                      {item.product?.image ? (
                        <img
                          src={item.product.image}
                          alt={item.product?.name || "Product"}
                          className="w-20 h-20 object-cover rounded-lg border"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-lg border border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                          <span className="text-xs text-gray-400">No image</span>
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900 truncate">
                              {item.product?.name || item.label || "Wishlist Item"}
                            </h3>
                            {item.product?.brand && (
                              <p className="text-sm text-gray-600 mt-1">{item.product.brand}</p>
                            )}
                            {item.product?.description && (
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.product.description}</p>
                            )}
                          </div>
                          
                          {item.product?.price && (
                            <div className="text-right">
                              <p className="font-semibold text-green-600">
                                ${Number(item.product.price).toFixed(2)}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-3">
                            {item.product?.url && (
                              <a
                                href={item.product.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-green-700 hover:text-green-800 hover:underline"
                              >
                                <ExternalLink size={14} />
                                View Product
                              </a>
                            )}
                          </div>
                          <button
                            onClick={() => removeWishlistItem(item.id)}
                            className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors"
                          >
                            <Trash2 size={14} />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              wishlistStatus === "loaded" && (
                <div className="text-center py-12">
                  <Heart className="mx-auto text-gray-300" size={48} />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No items in wishlist</h3>
                  <p className="mt-2 text-gray-600">Start adding products to see them here</p>
                </div>
              )
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Calendar Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Calendar</h2>
                <p className="text-sm text-gray-600 mt-1">Your upcoming events</p>
              </div>
              <StatusBadge status={calendarStatus} />
            </div>

            {calendarStatus === "loading" && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            )}

            {calendarStatus === "error" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">Could not load events: {calendarError}</p>
              </div>
            )}

            {calendarStatus === "disconnected" && (
              <div className="text-center py-8">
                <Calendar className="mx-auto text-gray-300" size={40} />
                <h3 className="mt-4 font-medium text-gray-900">Connect Your Calendar</h3>
                <p className="mt-2 text-sm text-gray-600 mb-4">
                  Connect Google Calendar to see events and get recommendations
                </p>
              </div>
            )}

            {calendarStatus === "connected" && events.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600">No upcoming events found</p>
              </div>
            )}

            {calendarStatus === "connected" && events.length > 0 && (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {events.slice(0, 5).map((event) => (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{event.summary || "Untitled Event"}</h4>
                        {event.start && (
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(event.start).toLocaleDateString()} • {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                        {event.location && (
                          <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                            📍 {event.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {events.length > 5 && (
                  <p className="text-center text-sm text-gray-500 mt-4">
                    +{events.length - 5} more events
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Recommendations Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Recommendations</h2>
                <p className="text-sm text-gray-600 mt-1">Based on your calendar events</p>
              </div>
              <StatusBadge status={recStatus} />
            </div>

            {events.length === 0 ? (
              <div className="text-center py-8">
                <Sparkles className="mx-auto text-gray-300" size={40} />
                <h3 className="mt-4 font-medium text-gray-900">Connect Calendar First</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Connect your calendar to get personalized recommendations
                </p>
              </div>
            ) : recStatus === "loading" ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              </div>
            ) : recStatus === "error" ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">Could not load recommendations</p>
              </div>
            ) : (
              <div className="space-y-6">
                {[
                  { label: "Formal", data: formalRecs, color: "text-blue-600 bg-blue-50" },
                  { label: "Casual", data: casualRecs, color: "text-green-600 bg-green-50" },
                  { label: "Streetwear", data: streetRecs, color: "text-purple-600 bg-purple-50" },
                ].map((group) =>
                  group.data.length > 0 && (
                    <div key={group.label} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900">{group.label}</h4>
                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${group.color}`}>
                          {group.data.length} event{group.data.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="space-y-4">
                        {group.data.slice(0, 2).map((rec) => (
                          <div key={rec.eventId} className="border border-gray-200 rounded-lg p-4">
                            <div className="mb-3">
                              <h5 className="font-medium text-gray-900 truncate">{rec.title}</h5>
                              {rec.start && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(rec.start).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            {rec.items.length > 0 ? (
                              <div className="space-y-3">
                                {rec.items.map((item, idx) => (
                                  <a
                                    key={idx}
                                    href={item.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                                  >
                                    {item.image ? (
                                      <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-12 h-12 object-cover rounded-lg border"
                                      />
                                    ) : (
                                      <div className="w-12 h-12 rounded-lg border border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                                        <span className="text-xs text-gray-400">Img</span>
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                      {item.brand && (
                                        <p className="text-xs text-gray-500 truncate">{item.brand}</p>
                                      )}
                                    </div>
                                    <ExternalLink size={14} className="text-gray-400 group-hover:text-green-600 transition-colors" />
                                  </a>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 text-center py-2">No matching items found</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
                
                {formalRecs.length === 0 && casualRecs.length === 0 && streetRecs.length === 0 && (
                  <div className="text-center py-8">
                    <Sparkles className="mx-auto text-gray-300" size={40} />
                    <h3 className="mt-4 font-medium text-gray-900">No Recommendations</h3>
                    <p className="mt-2 text-sm text-gray-600">
                      No matching products found for your events
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
