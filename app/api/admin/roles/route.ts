import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse } from "@/lib/api-guard";
import { listRoles } from "@/lib/services/userService";

export async function GET(req: Request) {
  try {
    await requirePermission(req, "users.view");
    return NextResponse.json({ items: await listRoles() });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
