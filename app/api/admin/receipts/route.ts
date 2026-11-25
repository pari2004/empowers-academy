import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse } from "@/lib/api-guard";
import { listReceipts } from "@/lib/services/receiptService";

export async function GET(req: Request) {
  try {
    await requirePermission(req, "receipts.view");
    const { searchParams } = new URL(req.url);
    const result = await listReceipts({
      page: Number(searchParams.get("page") ?? 1),
      pageSize: Number(searchParams.get("pageSize") ?? 20),
      studentId: searchParams.get("studentId") ?? undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
