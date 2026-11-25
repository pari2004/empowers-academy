import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { reorderFaqs } from "@/lib/services/faqService";

const bodySchema = z.object({ orderedIds: z.array(z.string().uuid()) });

export async function POST(req: Request) {
  try {
    const session = await requirePermission(req, "faqs.update");
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) throw new ApiError("Invalid input", 422);
    await reorderFaqs(parsed.data.orderedIds, session.user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
