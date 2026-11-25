import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { getPaymentById } from "@/lib/services/paymentService";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, props: Params) {
  const params = await props.params;
  try {
    await requirePermission(req, "payments.view");
    const payment = await getPaymentById(params.id);
    if (!payment) throw new ApiError("Payment not found", 404);
    return NextResponse.json(payment);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
