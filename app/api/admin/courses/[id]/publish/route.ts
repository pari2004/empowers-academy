import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse } from "@/lib/api-guard";
import { publishCourse } from "@/lib/services/courseService";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "courses.publish");
    const { id } = params;
    const course = await publishCourse(id, session.user.id);
    return NextResponse.json(course);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
