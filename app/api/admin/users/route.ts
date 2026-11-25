import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { listUsers, createUser } from "@/lib/services/userService";
import { userCreateSchema } from "@/lib/validation/user";

export async function GET(req: Request) {
  try {
    await requirePermission(req, "users.view");
    return NextResponse.json({ items: await listUsers() });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requirePermission(req, "users.create");
    const parsed = userCreateSchema.safeParse(await req.json());
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
    const user = await createUser(parsed.data, session.user.id);
    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
