import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { listWorkflows, createWorkflow } from "@/lib/services/workflowService";
import { workflowSchema } from "@/lib/validation/workflow";

export async function GET(req: Request) {
  try {
    await requirePermission(req, "workflows.view");
    const { searchParams } = new URL(req.url);
    const result = await listWorkflows({
      page: Number(searchParams.get("page") ?? 1),
      pageSize: Number(searchParams.get("pageSize") ?? 20),
      search: searchParams.get("search") ?? undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requirePermission(req, "workflows.create");
    const body = await req.json();
    const parsed = workflowSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const workflow = await createWorkflow(parsed.data, session.user.id);
    return NextResponse.json(workflow, { status: 201 });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
