import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { getRefundById } from "@/lib/services/refundService";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, props: Params) {
  const params = await props.params;
  try {
    await requirePermission(req, "refunds.view");
    const refund = await getRefundById(params.id);
    if (!refund) throw new ApiError("Refund not found", 404);
    return NextResponse.json(refund);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
