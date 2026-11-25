import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { getAboutPage, updateAboutPage } from "@/lib/services/aboutPageService";
import { aboutPageUpdateSchema } from "@/lib/validation/aboutPage";

export async function GET(req: Request) {
  try {
    await requirePermission(req, "aboutPage.view");
    return NextResponse.json(await getAboutPage());
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requirePermission(req, "aboutPage.update");
    const parsed = aboutPageUpdateSchema.safeParse(await req.json());
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
    const page = await updateAboutPage(parsed.data, session.user.id);
    return NextResponse.json(page);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
