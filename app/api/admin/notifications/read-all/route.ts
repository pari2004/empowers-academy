import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse } from "@/lib/api-guard";
import { markAllRead } from "@/lib/services/notificationService";

export async function POST(req: Request) {
  try {
    const session = await requirePermission(req, "notifications.view");
    await markAllRead(session.user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
