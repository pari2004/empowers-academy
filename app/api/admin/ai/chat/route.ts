import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { sendMessage } from "@/lib/services/ai/aiChatService";
import { aiChatMessageRequestSchema } from "@/lib/validation/ai";

export async function POST(req: Request) {
  try {
    const session = await requirePermission(req, "ai.create");
    const body = await req.json();
    const parsed = aiChatMessageRequestSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const result = await sendMessage({
      userId: session.user.id,
      permissions: session.user.permissions ?? [],
      threadId: parsed.data.threadId,
      message: parsed.data.message,
    });
    return NextResponse.json(result);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
