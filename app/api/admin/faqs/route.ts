import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { listFaqs, createFaq } from "@/lib/services/faqService";
import { faqSchema } from "@/lib/validation/faq";

export async function GET(req: Request) {
  try {
    await requirePermission(req, "faqs.view");
    const items = await listFaqs();
    return NextResponse.json({ items });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requirePermission(req, "faqs.create");
    const parsed = faqSchema.safeParse(await req.json());
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
    const faq = await createFaq(parsed.data, session.user.id);
    return NextResponse.json(faq, { status: 201 });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
