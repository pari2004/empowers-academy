import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse } from "@/lib/api-guard";
import { listForUser } from "@/lib/services/notificationService";

// Always scoped to the caller's own session — every role (including STUDENT,
// which only ever gets `notifications.view`) sees only their own notifications.
export async function GET(req: Request) {
  try {
    const session = await requirePermission(req, "notifications.view");
    const { searchParams } = new URL(req.url);
    const isRead = searchParams.get("isRead");
    const isArchived = searchParams.get("isArchived");
    const result = await listForUser(session.user.id, {
      page: Number(searchParams.get("page") ?? 1),
      pageSize: Number(searchParams.get("pageSize") ?? 20),
      isRead: isRead === null ? undefined : isRead === "true",
      isArchived: isArchived === null ? undefined : isArchived === "true",
      priority: (searchParams.get("priority") as never) ?? undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
