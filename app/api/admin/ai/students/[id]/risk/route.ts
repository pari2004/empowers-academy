import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { can } from "@/lib/rbac";
import { predictRisk, getCachedRisk } from "@/lib/services/ai/aiStudentRiskService";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, props: Params) {
  const { id } = await props.params;
  try {
    await requirePermission(req, "ai.view");
    return NextResponse.json(await getCachedRisk(id));
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function POST(req: Request, props: Params) {
  const { id } = await props.params;
  try {
    const session = await requirePermission(req, "ai.create");
    if (!can(session, "students.view")) throw new ApiError("Forbidden: missing permission \"students.view\"", 403);
    const result = await predictRisk(id, session.user.id);
    return NextResponse.json(result);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
