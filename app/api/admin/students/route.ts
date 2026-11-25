import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { listStudents, createStudent } from "@/lib/services/studentService";
import { studentSchema } from "@/lib/validation/student";

export async function GET(req: Request) {
  try {
    await requirePermission(req, "students.view");
    const { searchParams } = new URL(req.url);
    const result = await listStudents({
      page: Number(searchParams.get("page") ?? 1),
      pageSize: Number(searchParams.get("pageSize") ?? 20),
      batchId: searchParams.get("batchId") ?? undefined,
      admissionStatus: (searchParams.get("admissionStatus") as never) ?? undefined,
      search: searchParams.get("search") ?? undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requirePermission(req, "students.create");
    const body = await req.json();
    const parsed = studentSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const student = await createStudent(parsed.data, session.user.id);
    return NextResponse.json(student, { status: 201 });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
