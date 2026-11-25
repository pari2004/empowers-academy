import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { getProgrammeDetailByCourseId, upsertProgrammeDetail, deleteProgrammeDetail } from "@/lib/services/programmeDetailService";
import { programmeDetailUpdateSchema } from "@/lib/validation/programmeDetail";
import { getCourseById } from "@/lib/services/courseService";

type Params = { params: Promise<{ courseId: string }> };

export async function GET(req: Request, props: Params) {
  const params = await props.params;
  try {
    await requirePermission(req, "programmeDetails.view");
    const { courseId } = params;
    const course = await getCourseById(courseId);
    if (!course) throw new ApiError("Course not found", 404);
    const detail = await getProgrammeDetailByCourseId(courseId);
    return NextResponse.json({ course, detail });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function PUT(req: Request, props: Params) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "programmeDetails.update");
    const { courseId } = params;
    const course = await getCourseById(courseId);
    if (!course) throw new ApiError("Course not found", 404);
    const parsed = programmeDetailUpdateSchema.safeParse(await req.json());
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
    const detail = await upsertProgrammeDetail(courseId, parsed.data, session.user.id);
    return NextResponse.json(detail);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function DELETE(req: Request, props: Params) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "programmeDetails.delete");
    const { courseId } = params;
    await deleteProgrammeDetail(courseId, session.user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
