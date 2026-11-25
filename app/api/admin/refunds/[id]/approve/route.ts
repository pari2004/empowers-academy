import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse } from "@/lib/api-guard";
import { approveRefund } from "@/lib/services/refundService";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, props: Params) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "refunds.update");
    const refund = await approveRefund(params.id, session.user.id);
    return NextResponse.json(refund);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
