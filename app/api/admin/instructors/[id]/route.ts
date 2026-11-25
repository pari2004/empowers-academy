import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { getInstructorById, updateInstructor, deleteInstructor } from "@/lib/services/instructorService";
import { instructorUpdateSchema } from "@/lib/validation/instructor";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, props: Params) {
  const params = await props.params;
  try {
    await requirePermission(req, "instructors.view");
    const { id } = params;
    const instructor = await getInstructorById(id);
    if (!instructor) throw new ApiError("Instructor not found", 404);
    return NextResponse.json(instructor);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function PATCH(req: Request, props: Params) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "instructors.update");
    const { id } = params;
    const body = await req.json();
    const parsed = instructorUpdateSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const instructor = await updateInstructor(id, parsed.data, session.user.id);
    return NextResponse.json(instructor);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function DELETE(req: Request, props: Params) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "instructors.delete");
    const { id } = params;
    await deleteInstructor(id, session.user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
