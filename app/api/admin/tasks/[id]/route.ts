import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { getTaskById, updateTask, deleteTask } from "@/lib/services/taskService";
import { taskUpdateSchema } from "@/lib/validation/task";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  try {
    await requirePermission(req, "tasks.view");
    const { id } = await params;
    const task = await getTaskById(id);
    if (!task) throw new ApiError("Task not found", 404);
    return NextResponse.json(task);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const session = await requirePermission(req, "tasks.update");
    const { id } = await params;
    const body = await req.json();
    const parsed = taskUpdateSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const task = await updateTask(id, parsed.data, session.user.id);
    return NextResponse.json(task);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const session = await requirePermission(req, "tasks.delete");
    const { id } = await params;
    await deleteTask(id, session.user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
