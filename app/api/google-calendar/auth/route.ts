import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const scopes = ["https://www.googleapis.com/auth/calendar.readonly"];

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;

  const redirectUri = process.env.GOOGLE_REDIRECT_URI!;
  const clientId = process.env.GOOGLE_CLIENT_ID!;

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", scopes.join(" "));
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");

  if (userEmail) {
    url.searchParams.set("login_hint", userEmail);
  }

  return NextResponse.redirect(url.toString());
}
