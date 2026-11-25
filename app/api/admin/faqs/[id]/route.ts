import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { getFaqById, updateFaq, deleteFaq } from "@/lib/services/faqService";
import { faqUpdateSchema } from "@/lib/validation/faq";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, props: Params) {
  const params = await props.params;
  try {
    await requirePermission(req, "faqs.view");
    const { id } = params;
    const faq = await getFaqById(id);
    if (!faq) throw new ApiError("FAQ not found", 404);
    return NextResponse.json(faq);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function PATCH(req: Request, props: Params) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "faqs.update");
    const { id } = params;
    const parsed = faqUpdateSchema.safeParse(await req.json());
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
    const faq = await updateFaq(id, parsed.data, session.user.id);
    return NextResponse.json(faq);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function DELETE(req: Request, props: Params) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "faqs.delete");
    const { id } = params;
    await deleteFaq(id, session.user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
