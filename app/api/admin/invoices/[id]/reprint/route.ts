import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse } from "@/lib/api-guard";
import { reprintInvoice } from "@/lib/services/invoiceService";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, props: Params) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "invoices.view");
    const invoice = await reprintInvoice(params.id, session.user.id);
    return NextResponse.json(invoice);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
