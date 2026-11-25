import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { updateMedia, deleteMedia } from "@/lib/services/mediaService";

const updateSchema = z.object({ altText: z.string().optional(), folderId: z.string().uuid().optional().nullable() });

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "media.update");
    const { id } = params;
    const parsed = updateSchema.safeParse(await req.json());
    if (!parsed.success) throw new ApiError("Invalid input", 422);
    const file = await updateMedia(id, parsed.data, session.user.id);
    return NextResponse.json(file);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "media.delete");
    const { id } = params;
    await deleteMedia(id, session.user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
