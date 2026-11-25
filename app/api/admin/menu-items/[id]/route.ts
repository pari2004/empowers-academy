import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { updateMenuItem, deleteMenuItem } from "@/lib/services/menuService";

const updateSchema = z.object({
  label: z.string().min(1).optional(),
  href: z.string().min(1).optional(),
  icon: z.string().optional().nullable(),
  isExternal: z.boolean().optional(),
  parentId: z.string().uuid().optional().nullable(),
});

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "menus.update");
    const { id } = params;
    const parsed = updateSchema.safeParse(await req.json());
    if (!parsed.success) throw new ApiError("Invalid input", 422);
    const item = await updateMenuItem(id, parsed.data, session.user.id);
    return NextResponse.json(item);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "menus.delete");
    const { id } = params;
    await deleteMenuItem(id, session.user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
