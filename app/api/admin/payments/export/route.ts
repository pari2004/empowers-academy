import { requirePermission, apiErrorResponse } from "@/lib/api-guard";
import { listAllPaymentsForExport } from "@/lib/services/paymentService";
import { toCsv, csvResponse } from "@/lib/csv";

export async function GET(req: Request) {
  try {
    await requirePermission(req, "payments.view");
    const rows = await listAllPaymentsForExport();

    const csv = toCsv(
      ["Student", "Email", "Course Id", "Type", "Method", "Amount", "Discount", "Status", "Receipt #", "Date"],
      rows.map((r) => [
        r.student.name,
        r.student.email,
        r.courseId,
        r.type,
        r.method,
        r.amount.toString(),
        r.discountAmount.toString(),
        r.status,
        r.receiptNumber,
        r.createdAt.toISOString(),
      ])
    );

    return csvResponse(csv, "payments.csv");
  } catch (err) {
    return apiErrorResponse(err);
  }
}
