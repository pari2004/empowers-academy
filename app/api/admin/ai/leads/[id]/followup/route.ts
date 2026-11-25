import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { can } from "@/lib/rbac";
import { suggestFollowUp, getCachedFollowUp } from "@/lib/services/ai/aiFollowUpService";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, props: Params) {
  const { id } = await props.params;
  try {
    await requirePermission(req, "ai.view");
    return NextResponse.json(await getCachedFollowUp(id));
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function POST(req: Request, props: Params) {
  const { id } = await props.params;
  try {
    const session = await requirePermission(req, "ai.create");
    if (!can(session, "leads.view")) throw new ApiError("Forbidden: missing permission \"leads.view\"", 403);
    const result = await suggestFollowUp(id, session.user.id);
    return NextResponse.json(result);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
