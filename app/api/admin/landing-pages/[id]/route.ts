import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { getLandingPageById, updateLandingPage, deleteLandingPage } from "@/lib/services/landingPageService";
import { landingPageUpdateSchema } from "@/lib/validation/landingPage";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, props: Params) {
  const params = await props.params;
  try {
    await requirePermission(req, "landingPages.view");
    const { id } = params;
    const page = await getLandingPageById(id);
    if (!page) throw new ApiError("Landing page not found", 404);
    return NextResponse.json(page);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function PATCH(req: Request, props: Params) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "landingPages.update");
    const { id } = params;
    const parsed = landingPageUpdateSchema.safeParse(await req.json());
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
    const page = await updateLandingPage(id, parsed.data, session.user.id);
    return NextResponse.json(page);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function DELETE(req: Request, props: Params) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "landingPages.delete");
    const { id } = params;
    await deleteLandingPage(id, session.user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
