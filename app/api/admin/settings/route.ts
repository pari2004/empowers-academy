import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { getSiteSettings, updateSiteSettings } from "@/lib/services/settingsService";
import { settingsUpdateSchema } from "@/lib/validation/settings";

export async function GET(req: Request) {
  try {
    await requirePermission(req, "settings.view");
    return NextResponse.json(await getSiteSettings());
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requirePermission(req, "settings.update");
    const parsed = settingsUpdateSchema.safeParse(await req.json());
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
    const settings = await updateSiteSettings(parsed.data, session.user.id);
    return NextResponse.json(settings);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
