import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { isReportType, getReportData, type ReportType } from "@/lib/services/financeReportDispatch";
import { toCsv, csvResponse } from "@/lib/csv";

type Params = { params: Promise<{ type: string }> };

function toCsvPayload(type: ReportType, data: unknown): { header: string[]; rows: (string | number | null | undefined)[][] } {
  switch (type) {
    case "revenue": {
      const rows = data as Array<{ student: { name: string }; courseTitle: string; amount: unknown; method: string; createdAt: Date }>;
      return {
        header: ["Student", "Course", "Amount", "Method", "Date"],
        rows: rows.map((r) => [r.student.name, r.courseTitle, r.amount?.toString(), r.method, r.createdAt.toISOString()]),
      };
    }
    case "pending-fees": {
      const rows = data as Array<{ student: { name: string; course: { title: string } }; pendingAmount: unknown; paymentStatus: string }>;
      return {
        header: ["Student", "Course", "Pending Amount", "Status"],
        rows: rows.map((r) => [r.student.name, r.student.course.title, r.pendingAmount?.toString(), r.paymentStatus]),
      };
    }
    case "installments": {
      const rows = data as Array<{ student: { name: string }; installmentNumber: number; dueDate: Date; amount: unknown; status: string }>;
      return {
        header: ["Student", "Installment #", "Due Date", "Amount", "Status"],
        rows: rows.map((r) => [r.student.name, r.installmentNumber, r.dueDate.toISOString(), r.amount?.toString(), r.status]),
      };
    }
    case "refunds": {
      const rows = data as Array<{ student: { name: string }; amount: unknown; type: string; status: string; createdAt: Date }>;
      return {
        header: ["Student", "Amount", "Type", "Status", "Date"],
        rows: rows.map((r) => [r.student.name, r.amount?.toString(), r.type, r.status, r.createdAt.toISOString()]),
      };
    }
    case "coupons": {
      const rows = data as Array<{ code: string; discountType: string; discountValue: unknown; usedCount: number; maxUsage: number; isActive: boolean }>;
      return {
        header: ["Code", "Discount Type", "Discount Value", "Used", "Max Usage", "Active"],
        rows: rows.map((r) => [r.code, r.discountType, r.discountValue?.toString(), r.usedCount, r.maxUsage, String(r.isActive)]),
      };
    }
    case "gateway-transactions": {
      const rows = data as Array<{ gateway: string; gatewayOrderId: string | null; status: string; createdAt: Date }>;
      return {
        header: ["Gateway", "Order Id", "Status", "Date"],
        rows: rows.map((r) => [r.gateway, r.gatewayOrderId, r.status, r.createdAt.toISOString()]),
      };
    }
    case "daily-collection": {
      const rows = data as Array<{ date: string; amount: number }>;
      return { header: ["Date", "Amount"], rows: rows.map((r) => [r.date, r.amount]) };
    }
    case "monthly-collection": {
      const rows = data as Array<{ month: string; amount: number }>;
      return { header: ["Month", "Amount"], rows: rows.map((r) => [r.month, r.amount]) };
    }
    case "course-wise-revenue": {
      const rows = data as Array<{ courseTitle: string; revenue: number; paymentCount: number }>;
      return { header: ["Course", "Revenue", "Payment Count"], rows: rows.map((r) => [r.courseTitle, r.revenue, r.paymentCount]) };
    }
    case "summary": {
      const s = data as { totalRevenue: number; totalRefunds: number; netRevenue: number; paymentCount: number; totalPendingFees: number };
      return {
        header: ["Total Revenue", "Total Refunds", "Net Revenue", "Payment Count", "Total Pending Fees"],
        rows: [[s.totalRevenue, s.totalRefunds, s.netRevenue, s.paymentCount, s.totalPendingFees]],
      };
    }
  }
}

export async function GET(req: Request, props: Params) {
  const params = await props.params;
  try {
    await requirePermission(req, "financeReports.view");
    if (!isReportType(params.type)) throw new ApiError("Unknown report type", 404);

    const { searchParams } = new URL(req.url);
    const data = await getReportData(params.type, searchParams);
    const { header, rows } = toCsvPayload(params.type, data);

    return csvResponse(toCsv(header, rows), `finance-${params.type}.csv`);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
