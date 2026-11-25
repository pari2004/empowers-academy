import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse } from "@/lib/api-guard";
import { listCoursesWithProgrammeDetail } from "@/lib/services/programmeDetailService";

export async function GET(req: Request) {
  try {
    await requirePermission(req, "programmeDetails.view");
    const { searchParams } = new URL(req.url);
    const items = await listCoursesWithProgrammeDetail({ search: searchParams.get("search") ?? undefined });
    return NextResponse.json({ items });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
