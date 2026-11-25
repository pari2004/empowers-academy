import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse } from "@/lib/api-guard";
import {
  getFinanceStats,
  getMonthlyRevenueSeries,
  getDailyCollectionsSeries,
  getRevenueByCourse,
  getPaymentMethodBreakdown,
  getOutstandingFeesByStatus,
} from "@/lib/services/financeDashboardService";

export async function GET(req: Request) {
  try {
    await requirePermission(req, "payments.view");
    const [stats, monthlyRevenue, dailyCollections, revenueByCourse, paymentMethods, outstandingFees] = await Promise.all([
      getFinanceStats(),
      getMonthlyRevenueSeries(),
      getDailyCollectionsSeries(),
      getRevenueByCourse(),
      getPaymentMethodBreakdown(),
      getOutstandingFeesByStatus(),
    ]);
    return NextResponse.json({ stats, monthlyRevenue, dailyCollections, revenueByCourse, paymentMethods, outstandingFees });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
