import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { reorderMenuItems } from "@/lib/services/menuService";

const bodySchema = z.object({ orderedIds: z.array(z.string().uuid()) });

export async function POST(req: Request) {
  try {
    const session = await requirePermission(req, "menus.update");
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) throw new ApiError("Invalid input", 422);
    await reorderMenuItems(parsed.data.orderedIds, session.user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
