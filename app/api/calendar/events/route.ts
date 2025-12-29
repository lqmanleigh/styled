import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { classifyOccasion } from "@/lib/occasion";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const EVENTS_URL = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

async function refreshAccessToken(refreshToken: string) {
  const body = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Failed to refresh token: ${detail}`);
  }

  return res.json();
}

export async function GET(req: NextRequest) {
  const searchQuery = req.nextUrl.searchParams.get("q") ?? undefined;
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;
  if (!userEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const account = await prisma.account.findFirst({
    where: { userId: user.id, provider: "google-calendar" },
    select: {
      access_token: true,
      refresh_token: true,
      expires_at: true,
      scope: true,
      token_type: true,
    },
  });

  if (!account || !account.access_token) {
    return NextResponse.json({ connected: false, events: [] }, { status: 404 });
  }

  let accessToken = account.access_token;

  // Refresh token if expired (1 minute skew)
  const now = Math.floor(Date.now() / 1000);
  if (account.expires_at && account.expires_at - 60 <= now && account.refresh_token) {
    try {
      const refreshed = await refreshAccessToken(account.refresh_token);
      accessToken = refreshed.access_token ?? accessToken;
      const expiresAt = refreshed.expires_in
        ? Math.floor(Date.now() / 1000 + Number(refreshed.expires_in))
        : account.expires_at;

      await prisma.account.updateMany({
        where: { userId: user.id, provider: "google-calendar" },
        data: {
          access_token: accessToken,
          refresh_token: refreshed.refresh_token ?? account.refresh_token,
          expires_at: expiresAt,
          scope: refreshed.scope ?? account.scope,
          token_type: refreshed.token_type ?? account.token_type,
        },
      });
    } catch (err) {
      return NextResponse.json({ error: "Token refresh failed" }, { status: 401 });
    }
  }

  const url = new URL(EVENTS_URL);
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");
  url.searchParams.set("maxResults", "10");
  url.searchParams.set("timeMin", new Date().toISOString());
  url.searchParams.set("timeMax", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()); // next 7 days
  url.searchParams.set("fields", "items(id,summary,description,start,end,location,status)");
  if (searchQuery) url.searchParams.set("q", searchQuery);

  const eventsRes = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!eventsRes.ok) {
    const detail = await eventsRes.text();
    return NextResponse.json({ error: "Failed to load events", detail }, { status: 502 });
  }

  const eventsJson = await eventsRes.json();
  const items =
    eventsJson?.items
      ?.filter((e: any) => e?.status !== "cancelled")
      .map((e: any) => ({
        id: e.id,
        summary: e.summary || "Untitled event",
        description: e.description || "",
        start: e.start?.dateTime || e.start?.date || null,
        end: e.end?.dateTime || e.end?.date || null,
        location: e.location || null,
        occasionLabel: classifyOccasion(e.summary || "", e.description || ""),
      })) ?? [];

  return NextResponse.json({ connected: true, events: items });
}
