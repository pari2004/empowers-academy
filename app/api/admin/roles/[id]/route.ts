import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { updateRolePermissions } from "@/lib/services/userService";
import { roleUpdateSchema } from "@/lib/validation/user";

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "users.update");
    const { id } = params;
    const parsed = roleUpdateSchema.safeParse(await req.json());
    if (!parsed.success) throw new ApiError("Invalid input", 422);
    const role = await updateRolePermissions(id, parsed.data.permissions, session.user.id);
    return NextResponse.json(role);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
