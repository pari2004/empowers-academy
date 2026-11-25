import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { emailInvoice } from "@/lib/services/invoiceService";
import { emailInvoiceSchema } from "@/lib/validation/invoice";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, props: Params) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "invoices.update");
    const parsed = emailInvoiceSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const invoice = await emailInvoice(params.id, parsed.data.to, session.user.id);
    return NextResponse.json(invoice);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
