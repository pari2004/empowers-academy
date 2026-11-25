import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { addTaskAttachment } from "@/lib/services/taskService";
import { taskAttachmentSchema } from "@/lib/validation/task";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  try {
    const session = await requirePermission(req, "tasks.update");
    const { id } = await params;
    const body = await req.json();
    const parsed = taskAttachmentSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const attachment = await addTaskAttachment(id, parsed.data, session.user.id);
    return NextResponse.json(attachment, { status: 201 });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
