import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { rejectRefund } from "@/lib/services/refundService";
import { rejectRefundSchema } from "@/lib/validation/refund";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, props: Params) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "refunds.update");
    const body = await req.json();
    const parsed = rejectRefundSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const refund = await rejectRefund(params.id, parsed.data.reason, session.user.id);
    return NextResponse.json(refund);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
