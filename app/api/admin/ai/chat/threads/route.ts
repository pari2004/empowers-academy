import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse } from "@/lib/api-guard";
import { listThreads } from "@/lib/services/ai/aiChatService";

export async function GET(req: Request) {
  try {
    const session = await requirePermission(req, "ai.view");
    const threads = await listThreads(session.user.id);
    return NextResponse.json(threads);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
