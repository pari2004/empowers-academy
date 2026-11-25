import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { authConfig } from "@/lib/auth.config";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;

async function isLockedOut(email: string, ip: string): Promise<boolean> {
  const since = new Date(Date.now() - LOCKOUT_WINDOW_MS);
  const failedCount = await prisma.loginAttempt.count({
    where: { email, ip, success: false, createdAt: { gte: since } },
  });
  return failedCount >= MAX_FAILED_ATTEMPTS;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials, request) {
        const email = (credentials?.email as string | undefined)?.toLowerCase().trim();
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const ip =
          request?.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

        if (await isLockedOut(email, ip)) {
          throw new Error("Too many failed attempts. Try again in a few minutes.");
        }

        const user = await prisma.user.findUnique({
          where: { email },
          include: { role: true },
        });

        const valid =
          !!user && !user.deletedAt && user.isActive
            ? await bcrypt.compare(password, user.passwordHash)
            : false;

        await prisma.loginAttempt.create({ data: { email, ip, success: valid } });

        if (!valid || !user) {
          await logActivity({ action: "LOGIN_FAILED", metadata: { email, ip } });
          return null;
        }

        await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
        await logActivity({ userId: user.id, action: "LOGIN", metadata: { ip } });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role.name,
          permissions: user.role.permissions,
        };
      },
    }),
  ],
});
