import * as reports from "@/lib/services/financeReportService";

export const REPORT_TYPES = [
  "revenue",
  "pending-fees",
  "installments",
  "refunds",
  "coupons",
  "gateway-transactions",
  "summary",
  "daily-collection",
  "monthly-collection",
  "course-wise-revenue",
] as const;

export type ReportType = (typeof REPORT_TYPES)[number];

export function isReportType(value: string): value is ReportType {
  return (REPORT_TYPES as readonly string[]).includes(value);
}

export function parseDateFilter(searchParams: URLSearchParams) {
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  return { dateFrom: dateFrom ? new Date(dateFrom) : undefined, dateTo: dateTo ? new Date(dateTo) : undefined };
}

/** One parameterized dispatcher rather than 10 near-identical route handlers —
 *  mirrors leadService.transitionStage's "one operation, many targets" precedent. */
export async function getReportData(type: ReportType, searchParams: URLSearchParams) {
  const filter = parseDateFilter(searchParams);
  switch (type) {
    case "revenue":
      return reports.getRevenueReport(filter);
    case "pending-fees":
      return reports.getPendingFeesReport();
    case "installments":
      return reports.getInstallmentsReport(filter);
    case "refunds":
      return reports.getRefundsReport(filter);
    case "coupons":
      return reports.getCouponsReport();
    case "gateway-transactions":
      return reports.getGatewayTransactionsReport(filter);
    case "summary":
      return reports.getFinanceSummaryReport(filter);
    case "daily-collection":
      return reports.getDailyCollectionReport(filter);
    case "monthly-collection":
      return reports.getMonthlyCollectionReport(searchParams.get("year") ? Number(searchParams.get("year")) : undefined);
    case "course-wise-revenue":
      return reports.getCourseWiseRevenueReport();
  }
}
