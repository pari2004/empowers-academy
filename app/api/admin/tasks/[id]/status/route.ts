import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { transitionTaskStatus } from "@/lib/services/taskService";
import { taskStatusTransitionSchema } from "@/lib/validation/task";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  try {
    const session = await requirePermission(req, "tasks.update");
    const { id } = await params;
    const body = await req.json();
    const parsed = taskStatusTransitionSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const task = await transitionTaskStatus(id, parsed.data.status, session.user.id);
    return NextResponse.json(task);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
