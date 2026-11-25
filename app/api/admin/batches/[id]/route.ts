import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { getBatchById, updateBatch, deleteBatch } from "@/lib/services/batchService";
import { batchUpdateSchema } from "@/lib/validation/batch";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, props: Params) {
  const params = await props.params;
  try {
    await requirePermission(req, "batches.view");
    const batch = await getBatchById(params.id);
    if (!batch) throw new ApiError("Batch not found", 404);
    return NextResponse.json(batch);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function PATCH(req: Request, props: Params) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "batches.update");
    const body = await req.json();
    const parsed = batchUpdateSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const batch = await updateBatch(params.id, parsed.data, session.user.id);
    return NextResponse.json(batch);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function DELETE(req: Request, props: Params) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "batches.delete");
    await deleteBatch(params.id, session.user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
