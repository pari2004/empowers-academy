import { PrismaClient } from "@prisma/client";

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    ...(process.env.DATABASE_URL ? { datasources: { db: { url: withPoolParams(process.env.DATABASE_URL) } } } : {}),
  }).$extends({
    query: {
      $allModels: {
        // Transient connection errors (the DB is briefly unreachable, the
        // engine hasn't spun up, or the pool is momentarily exhausted) are
        // common when a build/serverless sandbox talks to a hosted DB proxy
        // like Railway's. Retrying with a short backoff turns those blips into
        // real results instead of a failed `next build` or a 500 at runtime.
        // We only retry the codes below and always rethrow everything else, so
        // genuine query errors still surface immediately.
        async $allOperations({ args, query }) {
          let lastError: unknown;
          for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt++) {
            try {
              return await query(args);
            } catch (error) {
              const code = (error as { code?: string })?.code;
              if (!code || !RETRYABLE_CODES.has(code) || attempt === RETRY_ATTEMPTS - 1) throw error;
              lastError = error;
              await sleep(250 * 2 ** attempt); // 250ms, 500ms, 1000ms
            }
          }
          throw lastError;
        },
      },
    },
  });
}

// P1001/P1002/P1017: can't reach / lost connection to the DB. P1008: operation
// timed out. P2024: timed out fetching a connection from Prisma's own pool.
const RETRYABLE_CODES = new Set(["P1001", "P1002", "P1008", "P1017", "P2024"]);
const RETRY_ATTEMPTS = 4;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Prisma's default connection_limit is derived from the detected CPU count,
// which in constrained build/serverless sandboxes (e.g. Vercel) can come out
// as low as 1-3 — too small for the fan-out of concurrent queries a page
// render issues against a single client. Set it explicitly so queries queue on
// the DB rather than timing out on Prisma's own pool.
function withPoolParams(url: string | undefined): string {
  if (!url) return "";
  try {
    const u = new URL(url);
    if (!u.searchParams.has("connection_limit")) u.searchParams.set("connection_limit", "5");
    if (!u.searchParams.has("pool_timeout")) u.searchParams.set("pool_timeout", "20");
    return u.toString();
  } catch {
    return url;
  }
}

const globalForPrisma = globalThis as unknown as { prisma?: ReturnType<typeof createPrismaClient> };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// The `$extends` retry wrapper changes the client type, so the interactive
// `$transaction` callback no longer hands back a plain `Prisma.TransactionClient`.
// Helpers that accept a transaction handle should type it against this instead.
export type PrismaTransactionClient = Omit<
  typeof prisma,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;
