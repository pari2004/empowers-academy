import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { updateEnquiry, deleteEnquiry } from "@/lib/services/contactService";
import { contactEnquiryUpdateSchema } from "@/lib/validation/contact";

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "contacts.update");
    const { id } = params;
    const parsed = contactEnquiryUpdateSchema.safeParse(await req.json());
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
    const enquiry = await updateEnquiry(id, parsed.data, session.user.id);
    return NextResponse.json(enquiry);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "contacts.delete");
    await deleteEnquiry(params.id, session.user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
