import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { getBrochureById, updateBrochure, deleteBrochure } from "@/lib/services/brochureService";
import { brochureUpdateSchema } from "@/lib/validation/brochure";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, props: Params) {
  const params = await props.params;
  try {
    await requirePermission(req, "brochures.view");
    const { id } = params;
    const brochure = await getBrochureById(id);
    if (!brochure) throw new ApiError("Brochure not found", 404);
    return NextResponse.json(brochure);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function PATCH(req: Request, props: Params) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "brochures.update");
    const { id } = params;
    const parsed = brochureUpdateSchema.safeParse(await req.json());
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
    const brochure = await updateBrochure(id, parsed.data, session.user.id);
    return NextResponse.json(brochure);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function DELETE(req: Request, props: Params) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "brochures.delete");
    const { id } = params;
    await deleteBrochure(id, session.user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
