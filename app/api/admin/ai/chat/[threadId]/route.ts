import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { getThread } from "@/lib/services/ai/aiChatService";

type Params = { params: Promise<{ threadId: string }> };

export async function GET(req: Request, props: Params) {
  const { threadId } = await props.params;
  try {
    const session = await requirePermission(req, "ai.view");
    const thread = await getThread(threadId, session.user.id);
    return NextResponse.json(thread);
  } catch (err) {
    if (err instanceof Error && err.message === "Chat thread not found") {
      return apiErrorResponse(new ApiError(err.message, 404));
    }
    return apiErrorResponse(err);
  }
}
