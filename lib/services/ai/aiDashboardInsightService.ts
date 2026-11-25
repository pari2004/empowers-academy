import { z } from "zod";
import {
  getDashboardStats,
  getLeadStats,
  getLeadPipelineCounts,
  getAdmissionStats,
  getBatchFillRates,
} from "@/lib/services/dashboardService";
import { runCachedJsonFeature } from "@/lib/ai/run";
import { getValidatedInsight, GLOBAL_SCOPE } from "@/lib/ai/cache";

const resultSchema = z.object({
  headline: z.string(),
  insights: z.array(z.string()).default([]),
  risks: z.array(z.string()).default([]),
  opportunities: z.array(z.string()).default([]),
});

export type DashboardInsightResult = z.infer<typeof resultSchema>;

const SCOPE = { entityType: "dashboard", entityId: GLOBAL_SCOPE };

/** Reuses dashboardService's existing stat queries as its input rather than re-querying prisma directly. */
export async function getDashboardInsights(actorId?: string | null): Promise<DashboardInsightResult> {
  const [stats, leadStats, pipeline, admissionStats, batchFillRates] = await Promise.all([
    getDashboardStats(),
    getLeadStats(),
    getLeadPipelineCounts(),
    getAdmissionStats(),
    getBatchFillRates(),
  ]);

  return runCachedJsonFeature({
    feature: "DASHBOARD_INSIGHT",
    scope: SCOPE,
    actorId,
    schema: resultSchema,
    build: () => ({
      system:
        "You are a CRM analyst producing a short daily briefing for admissions/marketing leadership at an ed-tech " +
        "academy. Given the snapshot below, write one headline sentence, a few concrete insights, risks worth flagging, " +
        "and opportunities to act on. Be specific and reference the numbers given.",
      messages: [
        {
          role: "user",
          content: JSON.stringify({ stats, leadStats, pipeline, admissionStats, batchFillRates }, null, 2),
        },
      ],
    }),
  });
}

export function getCachedDashboardInsights(): Promise<DashboardInsightResult | null> {
  return getValidatedInsight("DASHBOARD_INSIGHT", SCOPE, resultSchema);
}
