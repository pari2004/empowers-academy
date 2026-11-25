import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { listBrochureCategories, createBrochureCategory } from "@/lib/services/brochureService";

export async function GET(req: Request) {
  try {
    await requirePermission(req, "brochures.view");
    return NextResponse.json({ items: await listBrochureCategories() });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    await requirePermission(req, "brochures.create");
    const parsed = z.object({ name: z.string().min(1) }).safeParse(await req.json());
    if (!parsed.success) throw new ApiError("Invalid input", 422);
    return NextResponse.json(await createBrochureCategory(parsed.data.name), { status: 201 });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
