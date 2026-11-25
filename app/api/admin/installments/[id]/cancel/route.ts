import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse } from "@/lib/api-guard";
import { cancelInstallment } from "@/lib/services/installmentService";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, props: Params) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "installments.update");
    const installment = await cancelInstallment(params.id, session.user.id);
    return NextResponse.json(installment);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
