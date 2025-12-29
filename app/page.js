"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const howSteps = [
  {
    title: "Web Data Integration",
    desc: "We collect trending fashion data from multiple e-commerce platforms in real time.",
    icon: "Web",
  },
  {
    title: "AI-Powered Insights",
    desc: "We analyze popularity, reviews, and seasonal trends to recommend what fits you best.",
    icon: "AI",
  },
  {
    title: "Unified Experience",
    desc: "Discover products from different brands - all in one curated place.",
    icon: "UX",
  },
];

export default function HomePage() {
  const [stepIndex, setStepIndex] = useState(0);
  const { data: session, status } = useSession();
  const [events, setEvents] = useState([]);
  const [calendarStatus, setCalendarStatus] = useState("idle"); // idle | loading | connected | disconnected | error
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

  return (
    <main className="bg-green-50 min-h-screen text-gray-800">
      {/* Navbar */}
      <header className="flex items-center justify-between px-8 py-4 bg-white shadow">
        <h1 className="text-2xl font-bold text-green-600">Styled</h1>

        <div className="flex items-center gap-2 w-1/3">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none"
          />
          <button className="bg-green-600 text-white px-4 py-2 rounded-r-lg hover:bg-green-700">
            Search
          </button>
        </div>

        <nav className="flex gap-6 text-sm font-medium">
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/shop">Shop</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/wishlist" className="font-semibold text-green-600">Wishlist</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-10 py-16 bg-gradient-to-br from-green-100 via-white to-green-50">
        <div className="md:w-1/2">
          <h2 className="text-5xl font-extrabold mb-4 text-green-700 leading-tight">
            Discover Fashion,
            <br />
            Personalized for You
          </h2>
          <p className="text-gray-600 mb-6 text-lg">
            Explore top styles curated from multiple online stores, powered by
            AI and real-time web data. Shop smart, shop contextually.
          </p>
        </div>

        <div className="md:w-1/2 mt-8 md:mt-0 flex justify-center">
          <Image
            src="/images/fashion-banner.png"
            alt="Fashion Banner"
            width={400}
            height={300}
            className="rounded-xl shadow-lg"
          />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-10 py-16 bg-white text-center">
        <h3 className="text-3xl font-bold mb-6 text-green-700">How Styled Works</h3>
        <div className="max-w-3xl mx-auto">
          <div className="bg-green-50 p-10 rounded-2xl shadow transition-all min-h-[220px] flex flex-col items-center justify-center">
            <div className="text-5xl mb-3">{current.icon}</div>
            <h4 className="text-2xl font-semibold mb-2">{current.title}</h4>
            <p className="text-gray-600 text-center">{current.desc}</p>
          </div>
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setStepIndex((prev) => (prev - 1 + howSteps.length) % howSteps.length)}
              className="px-4 py-2 border border-green-200 rounded-lg text-green-700 hover:bg-green-50"
              type="button"
              aria-label="Previous"
            >
              &lt;
            </button>
            <div className="flex gap-2">
              {howSteps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStepIndex(i)}
                  className={`h-2 w-8 rounded-full ${i === stepIndex ? "bg-green-600" : "bg-green-200 hover:bg-green-300"}`}
                  aria-label={`Go to slide ${i + 1}`}
                  type="button"
                />
              ))}
            </div>
            <button
              onClick={() => setStepIndex((prev) => (prev + 1) % howSteps.length)}
              className="px-4 py-2 border border-green-200 rounded-lg text-green-700 hover:bg-green-50"
              type="button"
              aria-label="Next"
            >
              &gt;
            </button>
          </div>
        </div>
      </section>

      {/* Calendar & occasions for signed-in users */}
      {status === "authenticated" && (
        <section className="px-10 py-12 bg-white">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h3 className="text-2xl font-bold text-green-700">Your Upcoming Events</h3>
              <p className="text-gray-600 text-sm">Pulled from your connected Google Calendar.</p>
            </div>
            <Link
              href="/api/google-calendar/auth"
              className="text-sm px-4 py-2 border border-green-600 text-green-700 rounded hover:bg-green-50"
            >
              {calendarStatus === "connected" ? "Reconnect Calendar" : "Connect Calendar"}
            </Link>
          </div>

          {calendarStatus === "loading" && <p className="text-gray-500">Fetching events…</p>}
          {calendarStatus === "error" && (
            <p className="text-red-600 text-sm">Could not load events: {calendarError}</p>
          )}
          {calendarStatus === "disconnected" && (
            <p className="text-gray-600 text-sm">
              No calendar connected. Connect to see your upcoming occasions.
            </p>
          )}
          {calendarStatus === "connected" && events.length === 0 && (
            <p className="text-gray-600 text-sm">No upcoming events in the next 7 days.</p>
          )}
          {calendarStatus === "connected" && events.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event) => (
                <div key={event.id} className="border rounded-lg p-4 bg-green-50/60">
                  <p className="text-xs uppercase text-gray-500 mb-1">
                    {event.start ? new Date(event.start).toLocaleString() : "No start"}
                  </p>
                  <h4 className="text-lg font-semibold text-gray-800">{event.summary}</h4>
                  {event.location && <p className="text-sm text-gray-600 mt-1">{event.location}</p>}
                  <span className="inline-block mt-3 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">
                    Occasion: {event.occasionLabel || "general"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Footer */}
      <footer className="bg-white py-6 text-center text-gray-500 border-t">(c) {new Date().getFullYear()} Styled - All rights reserved.</footer>
    </main>
  );
}
