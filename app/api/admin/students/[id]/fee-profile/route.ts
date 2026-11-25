import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse } from "@/lib/api-guard";
import { getOrCreateFeeProfile, updateFeeProfile } from "@/lib/services/paymentService";
import { feeProfileUpdateSchema } from "@/lib/validation/payment";
import { ApiError } from "@/lib/api-guard";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, props: Params) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "payments.view");
    const profile = await getOrCreateFeeProfile(params.id, session.user.id);
    return NextResponse.json(profile);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function PATCH(req: Request, props: Params) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "payments.update");
    const body = await req.json();
    const parsed = feeProfileUpdateSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const profile = await updateFeeProfile(params.id, parsed.data, session.user.id);
    return NextResponse.json(profile);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
