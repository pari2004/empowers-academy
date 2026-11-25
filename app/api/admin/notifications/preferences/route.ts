import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { getPreference, upsertPreference } from "@/lib/services/notificationService";
import { notificationPreferenceSchema } from "@/lib/validation/notification";

export async function GET(req: Request) {
  try {
    const session = await requirePermission(req, "notifications.view");
    const pref = await getPreference(session.user.id);
    return NextResponse.json(pref);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function PUT(req: Request) {
  try {
    const session = await requirePermission(req, "notifications.view");
    const body = await req.json();
    const parsed = notificationPreferenceSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const pref = await upsertPreference(session.user.id, parsed.data, session.user.id);
    return NextResponse.json(pref);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
