import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse } from "@/lib/api-guard";
import { listInstallments } from "@/lib/services/installmentService";

export async function GET(req: Request) {
  try {
    await requirePermission(req, "installments.view");
    const { searchParams } = new URL(req.url);
    const result = await listInstallments({
      page: Number(searchParams.get("page") ?? 1),
      pageSize: Number(searchParams.get("pageSize") ?? 20),
      studentId: searchParams.get("studentId") ?? undefined,
      status: (searchParams.get("status") as never) ?? undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
