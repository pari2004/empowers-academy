import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { listCourses, createCourse } from "@/lib/services/courseService";
import { courseSchema } from "@/lib/validation/course";

export async function GET(req: Request) {
  try {
    const session = await requirePermission(req, "courses.view");
    void session;
    const { searchParams } = new URL(req.url);
    const result = await listCourses({
      page: Number(searchParams.get("page") ?? 1),
      pageSize: Number(searchParams.get("pageSize") ?? 20),
      status: (searchParams.get("status") as never) ?? undefined,
      search: searchParams.get("search") ?? undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requirePermission(req, "courses.create");
    const body = await req.json();
    const parsed = courseSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const course = await createCourse(parsed.data, session.user.id);
    return NextResponse.json(course, { status: 201 });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
