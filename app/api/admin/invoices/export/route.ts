import { requirePermission, apiErrorResponse } from "@/lib/api-guard";
import { listAllInvoicesForExport } from "@/lib/services/invoiceService";
import { toCsv, csvResponse } from "@/lib/csv";

export async function GET(req: Request) {
  try {
    await requirePermission(req, "invoices.view");
    const rows = await listAllInvoicesForExport();

    const csv = toCsv(
      ["Invoice #", "Student", "Amount", "GST", "Total", "Status", "Date"],
      rows.map((r) => [
        r.invoiceNumber,
        r.student.name,
        r.amount.toString(),
        r.gstAmount.toString(),
        r.totalAmount.toString(),
        r.status,
        r.createdAt.toISOString(),
      ])
    );

    return csvResponse(csv, "invoices.csv");
  } catch (err) {
    return apiErrorResponse(err);
  }
}
