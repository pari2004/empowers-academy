import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { listMasterclasses, createMasterclass } from "@/lib/services/masterclassService";
import { masterclassSchema } from "@/lib/validation/masterclass";

export async function GET(req: Request) {
  try {
    await requirePermission(req, "masterclasses.view");
    const items = await listMasterclasses();
    return NextResponse.json({ items });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requirePermission(req, "masterclasses.create");
    const body = await req.json();
    const parsed = masterclassSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const masterclass = await createMasterclass(parsed.data, session.user.id);
    return NextResponse.json(masterclass, { status: 201 });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
