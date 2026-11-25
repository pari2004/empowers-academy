import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { listBanners, createBanner } from "@/lib/services/bannerService";
import { bannerSchema } from "@/lib/validation/banner";

export async function GET(req: Request) {
  try {
    await requirePermission(req, "banners.view");
    return NextResponse.json({ items: await listBanners() });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requirePermission(req, "banners.create");
    const parsed = bannerSchema.safeParse(await req.json());
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
    const banner = await createBanner(parsed.data, session.user.id);
    return NextResponse.json(banner, { status: 201 });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
