import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse } from "@/lib/api-guard";
import { listAiRequestLogs } from "@/lib/services/aiLogService";
import type { AiFeature, AiRequestStatus } from "@prisma/client";

export async function GET(req: Request) {
  try {
    await requirePermission(req, "ai.view");
    const { searchParams } = new URL(req.url);
    const result = await listAiRequestLogs({
      page: Number(searchParams.get("page") ?? 1),
      pageSize: Number(searchParams.get("pageSize") ?? 30),
      feature: (searchParams.get("feature") as AiFeature | null) ?? undefined,
      status: (searchParams.get("status") as AiRequestStatus | null) ?? undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
