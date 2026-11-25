import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { listTasks, createTask } from "@/lib/services/taskService";
import { taskSchema, taskListQuerySchema } from "@/lib/validation/task";

export async function GET(req: Request) {
  try {
    await requirePermission(req, "tasks.view");
    const { searchParams } = new URL(req.url);
    const parsed = taskListQuerySchema.safeParse({
      page: Number(searchParams.get("page") ?? 1),
      pageSize: Number(searchParams.get("pageSize") ?? 20),
      status: searchParams.get("status") ?? undefined,
      priority: searchParams.get("priority") ?? undefined,
      assignedToId: searchParams.get("assignedToId") ?? undefined,
      search: searchParams.get("search") ?? undefined,
    });
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid query", 422);

    const result = await listTasks(parsed.data);
    return NextResponse.json(result);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requirePermission(req, "tasks.create");
    const body = await req.json();
    const parsed = taskSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const task = await createTask(parsed.data, session.user.id);
    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
