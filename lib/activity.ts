import { prisma } from "@/lib/db";

export type ActivityAction =
  | "LOGIN"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "PUBLISH"
  | "ARCHIVE"
  | "DUPLICATE"
  | "RESTORE"
  | "ROLE_CHANGE"
  | "STAGE_CHANGE";

/** Fire-and-forget audit trail entry. Never throws — a logging failure must not fail the calling mutation. */
export async function logActivity(params: {
  userId?: string | null;
  action: ActivityAction;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId: params.userId ?? null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        metadata: params.metadata as never,
      },
    });
  } catch (err) {
    console.error("logActivity failed", err);
  }
}
