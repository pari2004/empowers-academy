import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { getCourseById, updateCourse, deleteCourse } from "@/lib/services/courseService";
import { courseUpdateSchema } from "@/lib/validation/course";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, props: Params) {
  const params = await props.params;
  try {
    await requirePermission(req, "courses.view");
    const { id } = params;
    const course = await getCourseById(id);
    if (!course) throw new ApiError("Course not found", 404);
    return NextResponse.json(course);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function PATCH(req: Request, props: Params) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "courses.update");
    const { id } = params;
    const body = await req.json();
    const parsed = courseUpdateSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const course = await updateCourse(id, parsed.data, session.user.id);
    return NextResponse.json(course);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function DELETE(req: Request, props: Params) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "courses.delete");
    const { id } = params;
    await deleteCourse(id, session.user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
