import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { can } from "@/lib/rbac";
import { summarizeMeeting, getCachedMeetingSummary } from "@/lib/services/ai/aiMeetingSummaryService";
import { aiMeetingSummaryRequestSchema } from "@/lib/validation/ai";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, props: Params) {
  const { id } = await props.params;
  try {
    await requirePermission(req, "ai.view");
    return NextResponse.json(await getCachedMeetingSummary(id));
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function POST(req: Request, props: Params) {
  const { id } = await props.params;
  try {
    const session = await requirePermission(req, "ai.create");
    if (!can(session, "leads.view")) throw new ApiError("Forbidden: missing permission \"leads.view\"", 403);
    const body = await req.json();
    const parsed = aiMeetingSummaryRequestSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const result = await summarizeMeeting(id, parsed.data.transcript, session.user.id);
    return NextResponse.json(result);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
