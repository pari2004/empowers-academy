import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { getMasterclassById, updateMasterclass, deleteMasterclass } from "@/lib/services/masterclassService";
import { masterclassUpdateSchema } from "@/lib/validation/masterclass";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, props: Params) {
  const params = await props.params;
  try {
    await requirePermission(req, "masterclasses.view");
    const { id } = params;
    const masterclass = await getMasterclassById(id);
    if (!masterclass) throw new ApiError("Masterclass not found", 404);
    return NextResponse.json(masterclass);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function PATCH(req: Request, props: Params) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "masterclasses.update");
    const { id } = params;
    const body = await req.json();
    const parsed = masterclassUpdateSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const masterclass = await updateMasterclass(id, parsed.data, session.user.id);
    return NextResponse.json(masterclass);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function DELETE(req: Request, props: Params) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "masterclasses.delete");
    const { id } = params;
    await deleteMasterclass(id, session.user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
