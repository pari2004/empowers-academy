import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { assertRateLimit } from "@/lib/rateLimit";
import { sendBulkEmail } from "@/lib/services/emailService";
import { bulkSendEmailSchema } from "@/lib/validation/email";

export async function POST(req: Request) {
  try {
    const session = await requirePermission(req, "communications.create");
    assertRateLimit(`bulk-email:${session.user.id}`, 5, 60_000);

    const body = await req.json();
    const parsed = bulkSendEmailSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const result = await sendBulkEmail(parsed.data, session.user.id);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
