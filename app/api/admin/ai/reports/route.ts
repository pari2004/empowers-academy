import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { generateReport } from "@/lib/services/ai/aiReportService";
import { aiReportRequestSchema } from "@/lib/validation/ai";

export async function POST(req: Request) {
  try {
    const session = await requirePermission(req, "ai.create");
    const body = await req.json();
    const parsed = aiReportRequestSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const result = await generateReport(parsed.data, session.user.id);
    return NextResponse.json(result);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
