import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { listPayments, createManualPayment } from "@/lib/services/paymentService";
import { manualPaymentSchema } from "@/lib/validation/payment";

export async function GET(req: Request) {
  try {
    await requirePermission(req, "payments.view");
    const { searchParams } = new URL(req.url);
    const result = await listPayments({
      page: Number(searchParams.get("page") ?? 1),
      pageSize: Number(searchParams.get("pageSize") ?? 20),
      studentId: searchParams.get("studentId") ?? undefined,
      courseId: searchParams.get("courseId") ?? undefined,
      method: (searchParams.get("method") as never) ?? undefined,
      type: (searchParams.get("type") as never) ?? undefined,
      status: (searchParams.get("status") as never) ?? undefined,
      search: searchParams.get("search") ?? undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requirePermission(req, "payments.create");
    const body = await req.json();
    const parsed = manualPaymentSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const payment = await createManualPayment(parsed.data, session.user.id);
    return NextResponse.json(payment, { status: 201 });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
