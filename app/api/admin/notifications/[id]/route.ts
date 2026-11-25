import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse } from "@/lib/api-guard";
import { markRead, archiveNotification } from "@/lib/services/notificationService";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  try {
    const session = await requirePermission(req, "notifications.view");
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    if (body.action === "archive") {
      await archiveNotification(id, session.user.id);
    } else {
      await markRead(id, session.user.id);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
