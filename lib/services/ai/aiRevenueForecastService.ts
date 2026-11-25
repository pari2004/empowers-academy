import { z } from "zod";
import { prisma } from "@/lib/db";
import { runCachedJsonFeature } from "@/lib/ai/run";
import { getInsight, GLOBAL_SCOPE } from "@/lib/ai/cache";

const forecastSchema = z.object({
  forecast: z.array(z.object({ month: z.string(), predictedRevenue: z.number(), confidence: z.enum(["LOW", "MEDIUM", "HIGH"]) })),
  narrative: z.string(),
});

export type RevenueHistoryPoint = { month: string; revenue: number };
export type RevenueForecastResult = z.infer<typeof forecastSchema> & { history: RevenueHistoryPoint[] };

const SCOPE = { entityType: "revenue", entityId: GLOBAL_SCOPE };

/** No revenue aggregation exists elsewhere in the codebase — this is a small, purpose-built one over Student -> Course price. */
async function monthlyRevenueHistory(monthsBack = 6): Promise<RevenueHistoryPoint[]> {
  const since = new Date();
  since.setMonth(since.getMonth() - (monthsBack - 1));
  since.setDate(1);

  const students = await prisma.student.findMany({
    where: { deletedAt: null, enrolledAt: { gte: since } },
    select: { enrolledAt: true, course: { select: { price: true, discountPrice: true } } },
  });

  const buckets = new Map<string, number>();
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    buckets.set(d.toISOString().slice(0, 7), 0);
  }
  for (const s of students) {
    const key = s.enrolledAt.toISOString().slice(0, 7);
    if (!buckets.has(key)) continue;
    const price = s.course.discountPrice ?? s.course.price;
    buckets.set(key, (buckets.get(key) ?? 0) + (price ? Number(price) : 0));
  }
  return Array.from(buckets.entries()).map(([month, revenue]) => ({ month, revenue }));
}

export async function forecastRevenue(months = 3, actorId?: string | null): Promise<RevenueForecastResult> {
  const history = await monthlyRevenueHistory(6);

  const projection = await runCachedJsonFeature({
    feature: "REVENUE_FORECAST",
    scope: SCOPE,
    actorId,
    schema: forecastSchema,
    build: () => ({
      system:
        `You are a revenue forecasting assistant for an ed-tech academy. Given ${history.length} months of enrollment ` +
        `revenue history, project the next ${months} months and give a one-paragraph narrative explaining the trend. ` +
        "Use ISO month format (YYYY-MM) for each forecasted month, continuing directly after the last historical month.",
      messages: [{ role: "user", content: `Revenue history (month, revenue):\n${history.map((h) => `${h.month}: ${h.revenue}`).join("\n")}` }],
    }),
  });

  return { history, ...projection };
}

export async function getCachedRevenueForecast(): Promise<RevenueForecastResult | null> {
  const [history, cached] = await Promise.all([monthlyRevenueHistory(6), getInsight("REVENUE_FORECAST", SCOPE)]);
  if (!cached) return null;
  const parsed = forecastSchema.safeParse(cached.data);
  if (!parsed.success) return null;
  return { history, ...parsed.data };
}
