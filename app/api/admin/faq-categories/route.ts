import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { listFaqCategories, createFaqCategory } from "@/lib/services/faqService";
import { faqCategorySchema } from "@/lib/validation/faq";

export async function GET(req: Request) {
  try {
    await requirePermission(req, "faqs.view");
    const items = await listFaqCategories();
    return NextResponse.json({ items });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    await requirePermission(req, "faqs.create");
    const parsed = faqCategorySchema.safeParse(await req.json());
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
    const category = await createFaqCategory(parsed.data.name, parsed.data.order);
    return NextResponse.json(category, { status: 201 });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
