import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { updateUser, deleteUser } from "@/lib/services/userService";
import { userUpdateSchema } from "@/lib/validation/user";

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "users.update");
    const { id } = params;
    const parsed = userUpdateSchema.safeParse(await req.json());
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
    const user = await updateUser(id, parsed.data, session.user.id);
    return NextResponse.json(user);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "users.delete");
    const { id } = params;
    if (id === session.user.id) throw new ApiError("You cannot delete your own account", 400);
    await deleteUser(id, session.user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
