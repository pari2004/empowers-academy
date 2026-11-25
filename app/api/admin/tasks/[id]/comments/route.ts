import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { addTaskComment } from "@/lib/services/taskService";
import { taskCommentSchema } from "@/lib/validation/task";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  try {
    const session = await requirePermission(req, "tasks.update");
    const { id } = await params;
    const body = await req.json();
    const parsed = taskCommentSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const comment = await addTaskComment(id, parsed.data, session.user.id);
    return NextResponse.json(comment, { status: 201 });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
