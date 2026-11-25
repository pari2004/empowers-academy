import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { getCouponById, updateCoupon, deleteCoupon } from "@/lib/services/couponService";
import { couponUpdateSchema } from "@/lib/validation/coupon";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, props: Params) {
  const params = await props.params;
  try {
    await requirePermission(req, "coupons.view");
    const coupon = await getCouponById(params.id);
    if (!coupon) throw new ApiError("Coupon not found", 404);
    return NextResponse.json(coupon);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function PATCH(req: Request, props: Params) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "coupons.update");
    const body = await req.json();
    const parsed = couponUpdateSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const coupon = await updateCoupon(params.id, parsed.data, session.user.id);
    return NextResponse.json(coupon);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function DELETE(req: Request, props: Params) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "coupons.delete");
    await deleteCoupon(params.id, session.user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
