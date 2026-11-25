import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { getWorkflowById, updateWorkflow, deleteWorkflow } from "@/lib/services/workflowService";
import { workflowUpdateSchema } from "@/lib/validation/workflow";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  try {
    await requirePermission(req, "workflows.view");
    const { id } = await params;
    const workflow = await getWorkflowById(id);
    if (!workflow) throw new ApiError("Workflow not found", 404);
    return NextResponse.json(workflow);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const session = await requirePermission(req, "workflows.update");
    const { id } = await params;
    const body = await req.json();
    const parsed = workflowUpdateSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const workflow = await updateWorkflow(id, parsed.data, session.user.id);
    return NextResponse.json(workflow);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const session = await requirePermission(req, "workflows.delete");
    const { id } = await params;
    await deleteWorkflow(id, session.user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
