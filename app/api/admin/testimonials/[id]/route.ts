import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { getTestimonialById, updateTestimonial, deleteTestimonial } from "@/lib/services/testimonialService";
import { testimonialUpdateSchema } from "@/lib/validation/testimonial";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, props: Params) {
  const params = await props.params;
  try {
    await requirePermission(req, "testimonials.view");
    const { id } = params;
    const testimonial = await getTestimonialById(id);
    if (!testimonial) throw new ApiError("Testimonial not found", 404);
    return NextResponse.json(testimonial);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function PATCH(req: Request, props: Params) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "testimonials.update");
    const { id } = params;
    const body = await req.json();
    const parsed = testimonialUpdateSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const testimonial = await updateTestimonial(id, parsed.data, session.user.id);
    return NextResponse.json(testimonial);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function DELETE(req: Request, props: Params) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "testimonials.delete");
    const { id } = params;
    await deleteTestimonial(id, session.user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
