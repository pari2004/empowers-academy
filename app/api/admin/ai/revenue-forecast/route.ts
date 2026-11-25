import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { forecastRevenue, getCachedRevenueForecast } from "@/lib/services/ai/aiRevenueForecastService";
import { aiRevenueForecastRequestSchema } from "@/lib/validation/ai";

export async function GET(req: Request) {
  try {
    await requirePermission(req, "ai.view");
    return NextResponse.json(await getCachedRevenueForecast());
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requirePermission(req, "ai.create");
    const body = await req.json().catch(() => ({}));
    const parsed = aiRevenueForecastRequestSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const result = await forecastRevenue(parsed.data.months, session.user.id);
    return NextResponse.json(result);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
