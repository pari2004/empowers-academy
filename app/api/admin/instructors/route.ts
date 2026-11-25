import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { listInstructors, createInstructor } from "@/lib/services/instructorService";
import { instructorSchema } from "@/lib/validation/instructor";

export async function GET(req: Request) {
  try {
    await requirePermission(req, "instructors.view");
    const { searchParams } = new URL(req.url);
    const result = await listInstructors({
      page: Number(searchParams.get("page") ?? 1),
      pageSize: Number(searchParams.get("pageSize") ?? 50),
      search: searchParams.get("search") ?? undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requirePermission(req, "instructors.create");
    const body = await req.json();
    const parsed = instructorSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const instructor = await createInstructor(parsed.data, session.user.id);
    return NextResponse.json(instructor, { status: 201 });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
