import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse } from "@/lib/api-guard";
import { listInvoices } from "@/lib/services/invoiceService";

export async function GET(req: Request) {
  try {
    await requirePermission(req, "invoices.view");
    const { searchParams } = new URL(req.url);
    const result = await listInvoices({
      page: Number(searchParams.get("page") ?? 1),
      pageSize: Number(searchParams.get("pageSize") ?? 20),
      studentId: searchParams.get("studentId") ?? undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
