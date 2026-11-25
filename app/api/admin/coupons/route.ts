import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { listCoupons, createCoupon } from "@/lib/services/couponService";
import { couponSchema } from "@/lib/validation/coupon";

export async function GET(req: Request) {
  try {
    await requirePermission(req, "coupons.view");
    const { searchParams } = new URL(req.url);
    const isActiveParam = searchParams.get("isActive");
    const result = await listCoupons({
      page: Number(searchParams.get("page") ?? 1),
      pageSize: Number(searchParams.get("pageSize") ?? 20),
      isActive: isActiveParam === null ? undefined : isActiveParam === "true",
      search: searchParams.get("search") ?? undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requirePermission(req, "coupons.create");
    const body = await req.json();
    const parsed = couponSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const coupon = await createCoupon(parsed.data, session.user.id);
    return NextResponse.json(coupon, { status: 201 });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
