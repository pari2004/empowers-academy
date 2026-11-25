import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse } from "@/lib/api-guard";
import { duplicateCourse } from "@/lib/services/courseService";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "courses.create");
    const { id } = params;
    const course = await duplicateCourse(id, session.user.id);
    return NextResponse.json(course, { status: 201 });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
