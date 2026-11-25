import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { getReceiptById } from "@/lib/services/receiptService";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, props: Params) {
  const params = await props.params;
  try {
    await requirePermission(req, "receipts.view");
    const receipt = await getReceiptById(params.id);
    if (!receipt) throw new ApiError("Receipt not found", 404);
    return NextResponse.json(receipt);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
