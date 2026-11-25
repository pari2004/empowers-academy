import type { NextAuthConfig } from "next-auth";

// Edge-compatible auth config — no Prisma, no bcrypt. Used by both the full
// config in lib/auth.ts (Node runtime) and directly by middleware.ts (Edge
// runtime), which only needs to read/refresh the JWT session cookie, not
// authenticate credentials against the database.
export const authConfig: NextAuthConfig = {
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt" },
  // Auth.js v5 only trusts the request's Host header by default when
  // AUTH_URL/AUTH_TRUST_HOST is set, or on Vercel/Cloudflare Pages, or when
  // NODE_ENV !== "production" (dev mode). This app is self-hosted (this repo
  // sets the legacy NEXTAUTH_URL, not AUTH_URL) and doesn't run on either
  // platform, so under `next start` every auth() call threw UntrustedHost —
  // corrupting middleware's redirect check and crashing the dashboard layout's
  // session read — while `next dev` masked it via the NODE_ENV fallback.
  // Explicitly trusting the host is the documented fix for self-hosted deploys.
  trustHost: true,
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.permissions = user.permissions;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      session.user.permissions = token.permissions as string[];
      return session;
    },
  },
};
