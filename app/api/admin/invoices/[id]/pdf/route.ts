import { requirePermission, apiErrorResponse } from "@/lib/api-guard";
import { getInvoiceById, getInvoicePdfBuffer } from "@/lib/services/invoiceService";
import { ApiError } from "@/lib/api-guard";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, props: Params) {
  const params = await props.params;
  try {
    await requirePermission(req, "invoices.view");
    const invoice = await getInvoiceById(params.id);
    if (!invoice) throw new ApiError("Invoice not found", 404);

    const buffer = await getInvoicePdfBuffer(params.id);
    return new Response(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
