import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { markInstallmentPaid } from "@/lib/services/installmentService";
import { markInstallmentPaidSchema } from "@/lib/validation/installment";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, props: Params) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "installments.update");
    const body = await req.json();
    const parsed = markInstallmentPaidSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const installment = await markInstallmentPaid(params.id, parsed.data, session.user.id);
    return NextResponse.json(installment);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
