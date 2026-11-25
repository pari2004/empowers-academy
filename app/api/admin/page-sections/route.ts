import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { listSections, createSection } from "@/lib/services/pageSectionService";

const createSchema = z.object({
  landingPageId: z.string().uuid().nullable(),
  type: z.string().min(1),
  config: z.record(z.unknown()).default({}),
  backgroundColor: z.string().optional(),
  order: z.number().int().optional(),
});

export async function GET(req: Request) {
  try {
    await requirePermission(req, "homepage.view");
    const { searchParams } = new URL(req.url);
    const landingPageId = searchParams.get("landingPageId");
    const items = await listSections(landingPageId || null);
    return NextResponse.json({ items });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requirePermission(req, "homepage.update");
    const parsed = createSchema.safeParse(await req.json());
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
    const section = await createSection(parsed.data, session.user.id);
    return NextResponse.json(section, { status: 201 });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
