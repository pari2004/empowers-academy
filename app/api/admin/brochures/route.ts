import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { listBrochures, createBrochure } from "@/lib/services/brochureService";
import { brochureSchema } from "@/lib/validation/brochure";

export async function GET(req: Request) {
  try {
    await requirePermission(req, "brochures.view");
    const { searchParams } = new URL(req.url);
    const result = await listBrochures({
      page: Number(searchParams.get("page") ?? 1),
      pageSize: Number(searchParams.get("pageSize") ?? 20),
      status: searchParams.get("status") ?? undefined,
      categoryId: searchParams.get("categoryId") ?? undefined,
      search: searchParams.get("search") ?? undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requirePermission(req, "brochures.create");
    const parsed = brochureSchema.safeParse(await req.json());
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
    const brochure = await createBrochure(parsed.data, session.user.id);
    return NextResponse.json(brochure, { status: 201 });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
