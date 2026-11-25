import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { convertLeadToStudent } from "@/lib/services/studentService";
import { convertLeadSchema } from "@/lib/validation/student";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, props: Params) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "students.create");
    const body = await req.json().catch(() => ({}));
    const parsed = convertLeadSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const student = await convertLeadToStudent(params.id, parsed.data, session.user.id);
    return NextResponse.json(student, { status: 201 });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
