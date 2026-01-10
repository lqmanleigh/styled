import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Allow admin login page
  if (pathname === "/admin/login") return NextResponse.next();

  const isUserArea = pathname.startsWith("/user");
  const isAdminArea = pathname.startsWith("/admin");
  if (!isUserArea && !isAdminArea) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (isAdminArea) {
    if (token?.role === "ADMIN") return NextResponse.next();
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  if (!token) {
    const redirectTo = `/login?callbackUrl=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(new URL(redirectTo, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/user/:path*", "/admin/:path*"],
};
