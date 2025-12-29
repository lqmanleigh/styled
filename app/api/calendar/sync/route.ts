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

export async function POST(_req: NextRequest) {
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
    return NextResponse.json({ error: "Not connected" }, { status: 401 });
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

  const nowDate = new Date();
  const timeMin = nowDate.toISOString();
  const timeMax = new Date(nowDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(); // next 7 days

  const url = new URL(EVENTS_URL);
  url.searchParams.set("timeMin", timeMin);
  url.searchParams.set("timeMax", timeMax);
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");
  url.searchParams.set("fields", "items(id,summary,description,start,end,location,status)");

  const resCal = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!resCal.ok) {
    const detail = await resCal.text();
    return NextResponse.json({ error: "Failed to fetch events", detail }, { status: 502 });
  }

  const data = await resCal.json();
  const items = (data?.items ?? []).filter((ev: any) => ev?.status !== "cancelled");

  for (const ev of items) {
    const title = ev.summary ?? "Untitled event";
    const description = ev.description ?? "";
    const occasionLabel = classifyOccasion(title, description);
    const start = ev.start?.dateTime || ev.start?.date || null;
    const end = ev.end?.dateTime || ev.end?.date || null;

    // Upsert by (userId, providerEventId)
    await prisma.userEvent.upsert({
      where: {
        userId_providerEventId: {
          userId: user.id,
          providerEventId: ev.id,
        },
      },
      update: {
        title,
        description,
        startTime: start ? new Date(start) : new Date(),
        endTime: end ? new Date(end) : null,
        location: ev.location ?? null,
        occasionLabel,
        rawData: ev,
      },
      create: {
        userId: user.id,
        providerEventId: ev.id,
        title,
        description,
        startTime: start ? new Date(start) : new Date(),
        endTime: end ? new Date(end) : null,
        location: ev.location ?? null,
        occasionLabel,
        rawData: ev,
      },
    });
  }

  return NextResponse.json({ ok: true, synced: items.length });
}
