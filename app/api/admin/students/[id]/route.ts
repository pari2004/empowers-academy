import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { getStudentById, updateStudent } from "@/lib/services/studentService";
import { studentUpdateSchema } from "@/lib/validation/student";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, props: Params) {
  const params = await props.params;
  try {
    await requirePermission(req, "students.view");
    const student = await getStudentById(params.id);
    if (!student) throw new ApiError("Student not found", 404);
    return NextResponse.json(student);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function PATCH(req: Request, props: Params) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "students.update");
    const body = await req.json();
    const parsed = studentUpdateSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const student = await updateStudent(params.id, parsed.data, session.user.id);
    return NextResponse.json(student);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
