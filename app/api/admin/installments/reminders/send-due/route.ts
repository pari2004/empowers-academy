import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { sendBulkReminders } from "@/lib/services/reminderService";

const bodySchema = z.object({ type: z.enum(["UPCOMING", "OVERDUE", "FINAL"]) });

// Cron-hittable: an external scheduler (or the "Send Due Reminders" UI button)
// calls this with a fixed type to send every reminder currently due for that bucket.
export async function POST(req: Request) {
  try {
    const session = await requirePermission(req, "installments.update");
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const result = await sendBulkReminders(parsed.data.type, session.user.id);
    return NextResponse.json(result);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
