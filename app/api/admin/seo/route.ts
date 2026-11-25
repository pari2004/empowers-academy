import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { listSeoMeta, upsertSeoMeta } from "@/lib/services/seoService";
import { seoMetaSchema } from "@/lib/validation/seo";

export async function GET(req: Request) {
  try {
    await requirePermission(req, "seo.view");
    return NextResponse.json({ items: await listSeoMeta() });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    await requirePermission(req, "seo.update");
    const parsed = seoMetaSchema.safeParse(await req.json());
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
    return NextResponse.json(await upsertSeoMeta(parsed.data));
  } catch (err) {
    return apiErrorResponse(err);
  }
}
