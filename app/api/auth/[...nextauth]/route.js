export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      id: "admin-credentials",
      name: "Admin Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;
        const admin = await prisma.admin.findUnique({
          where: { username: credentials.username },
          select: { id: true, username: true, password: true },
        });
        if (!admin) return null;
        if (admin.password !== credentials.password) return null;
        return {
          id: admin.id,
          name: admin.username,
          email: `${admin.username}@admin.local`,
          role: "ADMIN",
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    // Persist role in JWT so middleware can authorize without DB access
    async jwt({ token, user }) {
      try {
        if (user) {
          let role = "USER";
          if (user.role === "ADMIN") {
            role = "ADMIN";
          } else if (user.email) {
            const dbUser = await prisma.user.findUnique({ where: { email: user.email }, select: { role: true } });
            role = dbUser?.role || (user.email.endsWith("@admin.com") ? "ADMIN" : "USER");
          }
          token.role = role;
          token.name = user.name || token.name;
          token.email = user.email || token.email;
        } else if (!token.role && token.email) {
          const dbUser = await prisma.user.findUnique({ where: { email: token.email }, select: { role: true } });
          token.role = dbUser?.role || "USER";
        }
      } catch (e) {
        // keep token usable even if DB fails
        token.role = token.role || "USER";
      }
      return token;
    },

    // Expose role on session from JWT
    async session({ session, token }) {
      if (token) session.user.role = token.role || "USER";
      return session;
    },

    // Redirect after login
    async redirect({ url, baseUrl }) {
      // Respect absolute URLs on same origin
      if (url.startsWith(baseUrl)) return url;
      // Support relative callback URLs like "/user/wishlist"
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Fallback: send to a known authenticated page
      return `${baseUrl}/user/wishlist`;
    },
  },
  events: {
    // Set role on first user creation
    async createUser({ user }) {
      try {
        const role = user?.email?.endsWith("@admin.com") ? "ADMIN" : "USER";
        await prisma.user.update({ where: { id: user.id }, data: { role } });
      } catch (e) {
        // Ignore errors to avoid breaking auth flow
      }
    },
  },
  pages: {
    signIn: "/login", // custom login page
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
