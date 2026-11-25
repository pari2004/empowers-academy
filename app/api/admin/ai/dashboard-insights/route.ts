import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse } from "@/lib/api-guard";
import { getDashboardInsights, getCachedDashboardInsights } from "@/lib/services/ai/aiDashboardInsightService";

export async function GET(req: Request) {
  try {
    await requirePermission(req, "ai.view");
    return NextResponse.json(await getCachedDashboardInsights());
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requirePermission(req, "ai.create");
    const result = await getDashboardInsights(session.user.id);
    return NextResponse.json(result);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
