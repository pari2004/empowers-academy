import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { validateCoupon } from "@/lib/services/couponService";
import { validateCouponSchema } from "@/lib/validation/coupon";

export async function POST(req: Request) {
  try {
    await requirePermission(req, "payments.create");
    const body = await req.json();
    const parsed = validateCouponSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const result = await validateCoupon(parsed.data.code, { amount: parsed.data.amount, courseId: parsed.data.courseId });
    if (result.error) throw new ApiError(result.error, 422);
    return NextResponse.json(result);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
