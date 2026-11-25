import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { createRazorpayOrder } from "@/lib/services/paymentService";
import { razorpayOrderRequestSchema } from "@/lib/validation/payment";

export async function POST(req: Request) {
  try {
    const session = await requirePermission(req, "payments.create");
    const body = await req.json();
    const parsed = razorpayOrderRequestSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const order = await createRazorpayOrder(parsed.data, session.user.id);
    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
