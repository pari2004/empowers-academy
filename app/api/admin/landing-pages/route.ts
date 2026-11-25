import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { listLandingPages, createLandingPage } from "@/lib/services/landingPageService";
import { landingPageSchema } from "@/lib/validation/landingPage";

export async function GET(req: Request) {
  try {
    await requirePermission(req, "landingPages.view");
    return NextResponse.json({ items: await listLandingPages() });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requirePermission(req, "landingPages.create");
    const parsed = landingPageSchema.safeParse(await req.json());
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
    const page = await createLandingPage(parsed.data, session.user.id);
    return NextResponse.json(page, { status: 201 });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
