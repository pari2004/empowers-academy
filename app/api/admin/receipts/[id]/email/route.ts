import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { emailReceipt } from "@/lib/services/receiptService";
import { emailReceiptSchema } from "@/lib/validation/invoice";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, props: Params) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "receipts.create");
    const parsed = emailReceiptSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const receipt = await emailReceipt(params.id, parsed.data.to, session.user.id);
    return NextResponse.json(receipt);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
