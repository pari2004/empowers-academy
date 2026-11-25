import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { confirmRazorpayPayment } from "@/lib/services/paymentService";
import { razorpayConfirmSchema } from "@/lib/validation/payment";

export async function POST(req: Request) {
  try {
    const session = await requirePermission(req, "payments.create");
    const body = await req.json();
    const parsed = razorpayConfirmSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const payment = await confirmRazorpayPayment(parsed.data, session.user.id);
    return NextResponse.json(payment);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
