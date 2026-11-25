import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { toggleWorkflow } from "@/lib/services/workflowService";
import { z } from "zod";

const toggleSchema = z.object({ isActive: z.boolean() });

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  try {
    const session = await requirePermission(req, "workflows.update");
    const { id } = await params;
    const body = await req.json();
    const parsed = toggleSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const workflow = await toggleWorkflow(id, parsed.data.isActive, session.user.id);
    return NextResponse.json(workflow);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
