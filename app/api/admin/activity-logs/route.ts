import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse } from "@/lib/api-guard";
import { listActivityLogs } from "@/lib/services/activityLogService";

export async function GET(req: Request) {
  try {
    await requirePermission(req, "activityLogs.view");
    const { searchParams } = new URL(req.url);
    const result = await listActivityLogs({
      page: Number(searchParams.get("page") ?? 1),
      pageSize: Number(searchParams.get("pageSize") ?? 30),
      action: searchParams.get("action") ?? undefined,
      entityType: searchParams.get("entityType") ?? undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
