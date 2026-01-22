"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const makeIcon = (glyph) => ({ className = "", size = 16 }) => (
  <span className={className} style={{ fontSize: size }} aria-hidden="true">
    {glyph}
  </span>
);

const Sparkles = makeIcon("*");
const Calendar = makeIcon(" ");
const ChevronLeft = makeIcon("<");
const ChevronRight = makeIcon(">");

const howSteps = [
  {
    title: "Web Data Integration",
    desc: "We collect trending fashion data from multiple e-commerce platforms in real time.",
    icon: <Sparkles className="w-12 h-12" />,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "AI-Powered Insights",
    desc: "We analyze popularity, reviews, and seasonal trends to recommend what fits you best.",
    icon: <Sparkles className="w-12 h-12" />,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "Unified Experience",
    desc: "Discover products from different brands - all in one curated place.",
    icon: <Sparkles className="w-12 h-12" />,
    gradient: "from-emerald-500 to-green-500",
  },
];

export default function HomePage() {
  const [stepIndex, setStepIndex] = useState(0);
  const { data: session, status } = useSession();
  const [events, setEvents] = useState([]);
  const [calendarStatus, setCalendarStatus] = useState("idle");
  const [calendarError, setCalendarError] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % howSteps.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    setCalendarStatus("loading");
    setCalendarError("");

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

  const current = howSteps[stepIndex];

  const StatusBadge = ({ status }) => {
    const config = {
      connected: { label: "Connected", color: "bg-green-100 text-green-800 border border-green-200" },
      disconnected: { label: "Disconnected", color: "bg-gray-100 text-gray-800 border border-gray-200" },
      loading: { label: "Loading...", color: "bg-blue-100 text-blue-800 border border-blue-200" },
      error: { label: "Error", color: "bg-red-100 text-red-800 border border-red-200" },
      idle: { label: "Idle", color: "bg-gray-100 text-gray-800 border border-gray-200" },
    };
    
    const { label, color } = config[status] || config.idle;
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>{label}</span>;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-green-50">
      {/* Navbar - unchanged as requested */}
      <header className="flex items-center justify-between px-8 py-4 bg-white shadow">
        <img
          src="https://res.cloudinary.com/djsbnythn/image/upload/v1768718065/logo_bjkqh7.png"
          alt="Styled Logo"
          className="h-12 w-auto"
        />

        <nav className="flex gap-6 text-sm font-medium">
          <Link href="/">Home</Link>
          <Link href="/shop">Shop</Link>
          <Link href="/wishlist" className="font-semibold text-green-600">Wishlist</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white/90 to-emerald-50/80" />
        <div className="relative px-4 md:px-10 py-16 md:py-24">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="lg:w-1/2 space-y-8">
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Discover Fashion,
                  <br />
                  <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                    Personalized for You
                  </span>
                </h1>
                <p className="mt-6 text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl">
                  Explore top styles curated from multiple online stores, suggestion, and real-time web data. Shop smart, shop occasionally.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white px-8 py-3.5 rounded-xl font-semibold hover:shadow-xl transition-all hover:scale-[1.02]"
                >
                  Start Shopping
                  <ChevronRight size={20} />
                </Link>
              </div>
            </div>
            
            <div className="lg:w-1/2 relative">
              <div className="absolute -top-6 -right-6 w-64 h-64 bg-gradient-to-br from-green-400 to-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 transform hover:scale-[1.02] transition-transform duration-300">
                <div className="aspect-[4/3] relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10" />
                  <Image
                    src="https://res.cloudinary.com/djsbnythn/image/upload/v1768790560/All_collection_blog_banner_1024x1024_scr3ld.webp"
                    alt="Fashion Banner"
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="p-6 bg-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-400 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Smart Recommendations</h3>
                      <p className="text-sm text-gray-600">Based on your style preferences</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium">Casual</span>
                    <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">Formal</span>
                    <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">Streetwear</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calendar & Occasions for Signed-in Users */}
      {status === "authenticated" && (
        <section className="px-4 md:px-10 py-12 md:py-20 bg-gradient-to-b from-white to-green-50">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-8 md:p-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-6 h-6 text-green-600" />
                      <span className="text-sm font-medium text-green-700 uppercase tracking-wider">
                        Calendar Integration
                      </span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Your Upcoming Events</h3>
                    <p className="text-gray-600">Pulled from your connected Google Calendar for personalized recommendations.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/api/google-calendar/auth"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-green-600 text-green-700 rounded-xl hover:bg-green-50 transition-all whitespace-nowrap"
                    >
                      <Calendar size={18} />
                      {calendarStatus === "connected" ? "Reconnect Calendar" : "Connect Calendar"}
                    </Link>
                    <div className="flex items-center justify-center">
                      <StatusBadge status={calendarStatus} />
                    </div>
                  </div>
                </div>

                {calendarStatus === "loading" && (
                  <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
                  </div>
                )}

                {calendarStatus === "error" && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <p className="text-red-800 font-medium mb-1">Could not load events</p>
                    <p className="text-red-600 text-sm">{calendarError}</p>
                  </div>
                )}

                {calendarStatus === "disconnected" && (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Calendar Connected</h4>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Connect your Google Calendar to see upcoming occasions and get personalized style recommendations.
                    </p>
                  </div>
                )}

                {calendarStatus === "connected" && events.length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-green-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Events</h4>
                    <p className="text-gray-600 max-w-md mx-auto">
                      No events scheduled for the next 7 days. Add events to your calendar to get personalized recommendations!
                    </p>
                  </div>
                )}

                {calendarStatus === "connected" && events.length > 0 && (
                  <>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      {events.slice(0, 6).map((event) => (
                        <div 
                          key={event.id} 
                          className="bg-white border border-gray-200 rounded-xl p-5 hover:border-green-300 hover:shadow-md transition-all"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 truncate">{event.summary || "Untitled Event"}</h4>
                              {event.location && (
                                <p className="text-sm text-gray-600 mt-1 truncate flex items-center gap-1">
                                  <span className="text-gray-400">??</span>
                                  {event.location}
                                </p>
                              )}
                            </div>
                          </div>
                          {event.start && (
                            <p className="text-xs text-gray-500 mb-3">
                              {new Date(event.start).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}
                              <span className="mx-1">•</span>
                              {new Date(event.start).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          )}
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                            <Sparkles size={12} />
                            {event.occasionLabel || "General Occasion"}
                          </div>
                        </div>
                      ))}
                    </div>
                    {events.length > 6 && (
                      <p className="text-center text-sm text-gray-500">
                        Showing {events.length > 6 ? 6 : events.length} of {events.length} events
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {!session && (
        <section className="px-4 md:px-10 py-16 bg-gradient-to-br from-green-600 to-emerald-500">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Style?
            </h3>
            <p className="text-lg text-green-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users who discover perfect outfits for every occasion
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/api/auth/signin"
                className="inline-flex items-center justify-center gap-2 bg-white text-green-600 px-8 py-3.5 rounded-xl font-semibold hover:shadow-2xl transition-all hover:scale-[1.02]"
              >
                <Calendar size={20} />
                Connect Calendar & Get Started
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition-all"
              >
                Browse Styles
                <ChevronRight size={20} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
<footer className="bg-white py-6 text-center text-gray-500 border-t">(c) {new Date().getFullYear()} Styled - All rights reserved.</footer>
    </main>
  );
}

