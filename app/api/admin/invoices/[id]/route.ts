import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { getInvoiceById } from "@/lib/services/invoiceService";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, props: Params) {
  const params = await props.params;
  try {
    await requirePermission(req, "invoices.view");
    const invoice = await getInvoiceById(params.id);
    if (!invoice) throw new ApiError("Invoice not found", 404);
    return NextResponse.json(invoice);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
