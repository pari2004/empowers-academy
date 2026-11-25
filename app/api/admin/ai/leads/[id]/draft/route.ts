import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { can } from "@/lib/rbac";
import { generateDraft, getCachedDraft } from "@/lib/services/ai/aiDraftService";
import { aiDraftChannelSchema, aiDraftRequestSchema } from "@/lib/validation/ai";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, props: Params) {
  const { id } = await props.params;
  try {
    await requirePermission(req, "ai.view");
    const { searchParams } = new URL(req.url);
    const parsedChannel = aiDraftChannelSchema.safeParse(searchParams.get("channel"));
    if (!parsedChannel.success) throw new ApiError("Query param 'channel' must be EMAIL or WHATSAPP", 422);
    return NextResponse.json(await getCachedDraft(id, parsedChannel.data));
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
    const parsed = aiDraftRequestSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const result = await generateDraft(id, parsed.data, session.user.id);
    return NextResponse.json(result);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
