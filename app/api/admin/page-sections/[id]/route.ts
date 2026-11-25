import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { updateSection, deleteSection } from "@/lib/services/pageSectionService";

const updateSchema = z.object({
  enabled: z.boolean().optional(),
  config: z.record(z.unknown()).optional(),
  backgroundColor: z.string().optional().nullable(),
});

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "homepage.update");
    const { id } = params;
    const parsed = updateSchema.safeParse(await req.json());
    if (!parsed.success) throw new ApiError("Invalid input", 422);
    const section = await updateSection(id, parsed.data, session.user.id);
    return NextResponse.json(section);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "homepage.update");
    const { id } = params;
    await deleteSection(id, session.user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
