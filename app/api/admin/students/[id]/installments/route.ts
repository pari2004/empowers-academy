import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { listInstallments, generateInstallmentPlan } from "@/lib/services/installmentService";
import { generateInstallmentPlanSchema } from "@/lib/validation/installment";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, props: Params) {
  const params = await props.params;
  try {
    await requirePermission(req, "installments.view");
    const result = await listInstallments({ studentId: params.id, pageSize: 100 });
    return NextResponse.json(result);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function POST(req: Request, props: Params) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "installments.create");
    const body = await req.json();
    const parsed = generateInstallmentPlanSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const result = await generateInstallmentPlan(params.id, parsed.data, session.user.id);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
