import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { can, type Permission } from "@/lib/rbac";
import { AiNotConfiguredError } from "@/lib/ai/types";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

/** Origin/Referer check for mutating REST routes — Server Actions get this for free from Next, route handlers don't. */
export function assertSameOrigin(req: Request): void {
  const origin = req.headers.get("origin");
  if (!origin) return; // same-origin requests from same-site navigations may omit Origin
  const host = req.headers.get("host");
  const originHost = (() => {
    try {
      return new URL(origin).host;
    } catch {
      return null;
    }
  })();
  if (originHost !== host) {
    throw new ApiError("Cross-origin request rejected", 403);
  }
}

/** Resolves the session and asserts `perm`, throwing ApiError(403) if missing. Call at the top of every mutating handler. */
export async function requirePermission(req: Request, perm: Permission) {
  assertSameOrigin(req);
  const session = await auth();
  if (!session?.user) throw new ApiError("Unauthorized", 401);
  if (!can(session, perm)) throw new ApiError(`Forbidden: missing permission "${perm}"`, 403);
  return session;
}

export function apiErrorResponse(err: unknown) {
  if (err instanceof ApiError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  if (err instanceof AiNotConfiguredError) {
    return NextResponse.json({ error: err.message }, { status: 503 });
  }
  console.error(err);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
