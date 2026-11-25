import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { listTestimonials, createTestimonial } from "@/lib/services/testimonialService";
import { testimonialSchema } from "@/lib/validation/testimonial";

export async function GET(req: Request) {
  try {
    await requirePermission(req, "testimonials.view");
    const items = await listTestimonials();
    return NextResponse.json({ items });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requirePermission(req, "testimonials.create");
    const body = await req.json();
    const parsed = testimonialSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const testimonial = await createTestimonial(parsed.data, session.user.id);
    return NextResponse.json(testimonial, { status: 201 });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
