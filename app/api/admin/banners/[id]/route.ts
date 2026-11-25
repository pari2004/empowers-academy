import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { getBannerById, updateBanner, deleteBanner } from "@/lib/services/bannerService";
import { bannerUpdateSchema } from "@/lib/validation/banner";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, props: Params) {
  const params = await props.params;
  try {
    await requirePermission(req, "banners.view");
    const { id } = params;
    const banner = await getBannerById(id);
    if (!banner) throw new ApiError("Banner not found", 404);
    return NextResponse.json(banner);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function PATCH(req: Request, props: Params) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "banners.update");
    const { id } = params;
    const parsed = bannerUpdateSchema.safeParse(await req.json());
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
    const banner = await updateBanner(id, parsed.data, session.user.id);
    return NextResponse.json(banner);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function DELETE(req: Request, props: Params) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "banners.delete");
    const { id } = params;
    await deleteBanner(id, session.user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
