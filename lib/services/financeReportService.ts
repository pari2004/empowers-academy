import { prisma } from "@/lib/db";

export type ReportDateFilter = { dateFrom?: Date; dateTo?: Date };

function dateWhere(field: string, filter: ReportDateFilter) {
  if (!filter.dateFrom && !filter.dateTo) return {};
  return {
    [field]: {
      ...(filter.dateFrom ? { gte: filter.dateFrom } : {}),
      ...(filter.dateTo ? { lte: filter.dateTo } : {}),
    },
  };
}

async function withCourseTitles<T extends { courseId: string }>(rows: T[]): Promise<Array<T & { courseTitle: string }>> {
  const courses = await prisma.course.findMany({ where: { id: { in: [...new Set(rows.map((r) => r.courseId))] } }, select: { id: true, title: true } });
  const titleById = new Map(courses.map((c) => [c.id, c.title]));
  return rows.map((r) => ({ ...r, courseTitle: titleById.get(r.courseId) ?? "Unknown" }));
}

export async function getRevenueReport(filter: ReportDateFilter = {}) {
  const rows = await prisma.payment.findMany({
    where: { status: "SUCCESS", ...dateWhere("createdAt", filter) },
    orderBy: { createdAt: "desc" },
    include: { student: { select: { name: true, email: true } } },
  });
  return withCourseTitles(rows);
}

export async function getPendingFeesReport() {
  return prisma.studentFeeProfile.findMany({
    where: { pendingAmount: { gt: 0 } },
    orderBy: { pendingAmount: "desc" },
    include: { student: { select: { name: true, email: true, course: { select: { title: true } } } } },
  });
}

export async function getInstallmentsReport(filter: ReportDateFilter = {}) {
  return prisma.installment.findMany({
    where: dateWhere("dueDate", filter),
    orderBy: { dueDate: "asc" },
    include: { student: { select: { name: true, email: true } } },
  });
}

export async function getRefundsReport(filter: ReportDateFilter = {}) {
  return prisma.refund.findMany({
    where: dateWhere("createdAt", filter),
    orderBy: { createdAt: "desc" },
    include: { student: { select: { name: true, email: true } }, payment: { select: { method: true, amount: true } } },
  });
}

export function getCouponsReport() {
  return prisma.coupon.findMany({ where: { deletedAt: null }, orderBy: { usedCount: "desc" } });
}

export async function getGatewayTransactionsReport(filter: ReportDateFilter = {}) {
  return prisma.paymentTransaction.findMany({
    where: dateWhere("createdAt", filter),
    orderBy: { createdAt: "desc" },
    include: { payment: { select: { studentId: true, method: true, amount: true } } },
  });
}

export async function getFinanceSummaryReport(filter: ReportDateFilter = {}) {
  const where = { status: "SUCCESS" as const, ...dateWhere("createdAt", filter) };
  const [revenue, refunds, paymentCount, pendingAgg] = await Promise.all([
    prisma.payment.aggregate({ where, _sum: { amount: true } }),
    prisma.refund.aggregate({ where: { status: "PROCESSED", ...dateWhere("createdAt", filter) }, _sum: { amount: true } }),
    prisma.payment.count({ where }),
    prisma.studentFeeProfile.aggregate({ _sum: { pendingAmount: true } }),
  ]);

  return {
    totalRevenue: Number(revenue._sum.amount ?? 0),
    totalRefunds: Number(refunds._sum.amount ?? 0),
    netRevenue: Number(revenue._sum.amount ?? 0) - Number(refunds._sum.amount ?? 0),
    paymentCount,
    totalPendingFees: Number(pendingAgg._sum.pendingAmount ?? 0),
  };
}

export async function getDailyCollectionReport(filter: ReportDateFilter = {}) {
  const rows = await prisma.payment.findMany({
    where: { status: "SUCCESS", ...dateWhere("createdAt", filter) },
    select: { amount: true, createdAt: true },
  });
  const buckets = new Map<string, number>();
  for (const row of rows) {
    const key = row.createdAt.toISOString().slice(0, 10);
    buckets.set(key, (buckets.get(key) ?? 0) + Number(row.amount));
  }
  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ date, amount: Math.round(amount * 100) / 100 }));
}

export async function getMonthlyCollectionReport(year = new Date().getFullYear()) {
  const rows = await prisma.payment.findMany({
    where: { status: "SUCCESS", createdAt: { gte: new Date(`${year}-01-01`), lt: new Date(`${year + 1}-01-01`) } },
    select: { amount: true, createdAt: true },
  });
  const buckets = new Map<string, number>();
  for (const row of rows) {
    const key = row.createdAt.toISOString().slice(0, 7);
    buckets.set(key, (buckets.get(key) ?? 0) + Number(row.amount));
  }
  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => ({ month, amount: Math.round(amount * 100) / 100 }));
}

export async function getCourseWiseRevenueReport() {
  const grouped = await prisma.payment.groupBy({ by: ["courseId"], where: { status: "SUCCESS" }, _sum: { amount: true }, _count: { id: true } });
  const courses = await prisma.course.findMany({ where: { id: { in: grouped.map((g) => g.courseId) } }, select: { id: true, title: true } });
  const titleById = new Map(courses.map((c) => [c.id, c.title]));
  return grouped
    .map((g) => ({ courseId: g.courseId, courseTitle: titleById.get(g.courseId) ?? "Unknown", revenue: Number(g._sum.amount ?? 0), paymentCount: g._count.id }))
    .sort((a, b) => b.revenue - a.revenue);
}
