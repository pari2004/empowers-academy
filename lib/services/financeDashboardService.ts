import { prisma } from "@/lib/db";

/** Just the two revenue numbers the main CRM dashboard needs — unlike getFinanceStats()
 *  below, this doesn't also compute pending fees/refunds/installments/success-rate
 *  aggregates the CRM dashboard doesn't use, keeping its added query cost minimal. */
export async function getRevenueSummary() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [todayAgg, monthAgg] = await Promise.all([
    prisma.payment.aggregate({ where: { status: "SUCCESS", createdAt: { gte: startOfToday } }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { status: "SUCCESS", createdAt: { gte: startOfMonth } }, _sum: { amount: true } }),
  ]);

  return {
    todayRevenue: Number(todayAgg._sum.amount ?? 0),
    monthlyRevenue: Number(monthAgg._sum.amount ?? 0),
  };
}

export async function getFinanceStats() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [todayAgg, monthAgg, pendingAgg, overdueCount, totalAgg, refundsAgg, activeInstallmentsCount, successCount, totalCount] =
    await Promise.all([
      prisma.payment.aggregate({ where: { status: "SUCCESS", createdAt: { gte: startOfToday } }, _sum: { amount: true } }),
      prisma.payment.aggregate({ where: { status: "SUCCESS", createdAt: { gte: startOfMonth } }, _sum: { amount: true } }),
      prisma.studentFeeProfile.aggregate({ _sum: { pendingAmount: true } }),
      prisma.installment.count({ where: { status: "OVERDUE" } }),
      prisma.payment.aggregate({ where: { status: "SUCCESS" }, _sum: { amount: true } }),
      prisma.refund.aggregate({ where: { status: "PROCESSED" }, _sum: { amount: true } }),
      prisma.installment.count({ where: { status: { in: ["PENDING", "OVERDUE"] } } }),
      prisma.payment.count({ where: { status: "SUCCESS" } }),
      prisma.payment.count({}),
    ]);

  return {
    todayRevenue: Number(todayAgg._sum.amount ?? 0),
    monthlyRevenue: Number(monthAgg._sum.amount ?? 0),
    pendingFees: Number(pendingAgg._sum.pendingAmount ?? 0),
    overduePayments: overdueCount,
    totalCollections: Number(totalAgg._sum.amount ?? 0),
    refundsTotal: Number(refundsAgg._sum.amount ?? 0),
    activeInstallments: activeInstallmentsCount,
    paymentSuccessRate: totalCount === 0 ? 0 : Math.round((successCount / totalCount) * 1000) / 10,
  };
}

// Reuses ChartCard's existing `{date, count}` series shape (see components/admin/charts/ChartCard.tsx)
// so LineChartCard/BarChartCard work unmodified — "count" holds the revenue amount here.
export async function getMonthlyRevenueSeries(months = 12) {
  const since = new Date();
  since.setMonth(since.getMonth() - (months - 1));
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const rows = await prisma.payment.findMany({
    where: { status: "SUCCESS", createdAt: { gte: since } },
    select: { amount: true, createdAt: true },
  });

  const buckets = new Map<string, number>();
  const cursor = new Date(since);
  for (let i = 0; i < months; i++) {
    buckets.set(cursor.toISOString().slice(0, 7), 0);
    cursor.setMonth(cursor.getMonth() + 1);
  }
  for (const row of rows) {
    const key = row.createdAt.toISOString().slice(0, 7);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + Number(row.amount));
  }

  return Array.from(buckets.entries()).map(([date, count]) => ({ date, count: Math.round(count * 100) / 100 }));
}

export async function getDailyCollectionsSeries(days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const rows = await prisma.payment.findMany({
    where: { status: "SUCCESS", createdAt: { gte: since } },
    select: { amount: true, createdAt: true },
  });

  const buckets = new Map<string, number>();
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }
  for (const row of rows) {
    const key = row.createdAt.toISOString().slice(0, 10);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + Number(row.amount));
  }

  return Array.from(buckets.entries()).map(([date, count]) => ({ date, count: Math.round(count * 100) / 100 }));
}

export async function getRevenueByCourse(limit = 8) {
  const grouped = await prisma.payment.groupBy({
    by: ["courseId"],
    where: { status: "SUCCESS" },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: limit,
  });

  const courses = await prisma.course.findMany({ where: { id: { in: grouped.map((g) => g.courseId) } }, select: { id: true, title: true } });
  const titleById = new Map(courses.map((c) => [c.id, c.title]));

  return grouped.map((g) => ({
    courseId: g.courseId,
    title: titleById.get(g.courseId) ?? "Unknown",
    amount: Number(g._sum.amount ?? 0),
  }));
}

export async function getPaymentMethodBreakdown() {
  const grouped = await prisma.payment.groupBy({
    by: ["method"],
    where: { status: "SUCCESS" },
    _sum: { amount: true },
  });

  return grouped.map((g) => ({ method: g.method, amount: Number(g._sum.amount ?? 0) }));
}

export async function getOutstandingFeesByStatus() {
  const grouped = await prisma.studentFeeProfile.groupBy({
    by: ["paymentStatus"],
    _count: { paymentStatus: true },
    _sum: { pendingAmount: true },
  });

  return grouped.map((g) => ({
    status: g.paymentStatus,
    count: g._count.paymentStatus,
    amount: Number(g._sum.pendingAmount ?? 0),
  }));
}
