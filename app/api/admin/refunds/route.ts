import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { listRefunds, createRefundRequest } from "@/lib/services/refundService";
import { refundRequestSchema } from "@/lib/validation/refund";

export async function GET(req: Request) {
  try {
    await requirePermission(req, "refunds.view");
    const { searchParams } = new URL(req.url);
    const result = await listRefunds({
      page: Number(searchParams.get("page") ?? 1),
      pageSize: Number(searchParams.get("pageSize") ?? 20),
      studentId: searchParams.get("studentId") ?? undefined,
      status: searchParams.get("status") ?? undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requirePermission(req, "refunds.create");
    const body = await req.json();
    const parsed = refundRequestSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const refund = await createRefundRequest(parsed.data, session.user.id);
    return NextResponse.json(refund, { status: 201 });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
