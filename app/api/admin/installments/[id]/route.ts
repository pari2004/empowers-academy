import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { getInstallmentById, updateInstallment } from "@/lib/services/installmentService";
import { installmentUpdateSchema } from "@/lib/validation/installment";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, props: Params) {
  const params = await props.params;
  try {
    await requirePermission(req, "installments.view");
    const installment = await getInstallmentById(params.id);
    if (!installment) throw new ApiError("Installment not found", 404);
    return NextResponse.json(installment);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function PATCH(req: Request, props: Params) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "installments.update");
    const body = await req.json();
    const parsed = installmentUpdateSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const installment = await updateInstallment(params.id, parsed.data, session.user.id);
    return NextResponse.json(installment);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
