import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) return NextResponse.json({ error: "No code" }, { status: 400 });

  // Ensure user is signed in (this callback is user-only)
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;
  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    grant_type: "authorization_code",
    access_type: "offline",
  });

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!tokenRes.ok) {
    const errorText = await tokenRes.text();
    return NextResponse.json({ error: "Token exchange failed", detail: errorText }, { status: 502 });
  }

  const tokenJson = await tokenRes.json();
  const expiresAt = tokenJson.expires_in
    ? Math.floor(Date.now() / 1000 + Number(tokenJson.expires_in))
    : null;

  // Store tokens on a dedicated Account row keyed to this user
  await prisma.account.upsert({
    where: {
      provider_providerAccountId: {
        provider: "google-calendar",
        providerAccountId: user.id,
      },
    },
    update: {
      access_token: tokenJson.access_token,
      refresh_token: tokenJson.refresh_token ?? undefined,
      expires_at: expiresAt ?? undefined,
      scope: tokenJson.scope,
      token_type: tokenJson.token_type,
      id_token: tokenJson.id_token ?? undefined,
    },
    create: {
      userId: user.id,
      type: "oauth",
      provider: "google-calendar",
      providerAccountId: user.id,
      access_token: tokenJson.access_token,
      refresh_token: tokenJson.refresh_token ?? null,
      expires_at: expiresAt,
      scope: tokenJson.scope ?? null,
      token_type: tokenJson.token_type ?? null,
      id_token: tokenJson.id_token ?? null,
    },
  });

  // Redirect back to user wishlist (user-only page)
  const redirectUrl = new URL("/user/wishlist", req.url);
  return NextResponse.redirect(redirectUrl);
}
