import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { getEmailTemplateById, updateEmailTemplate, deleteEmailTemplate } from "@/lib/services/emailTemplateService";
import { emailTemplateUpdateSchema } from "@/lib/validation/emailTemplate";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  try {
    await requirePermission(req, "emailTemplates.view");
    const { id } = await params;
    const template = await getEmailTemplateById(id);
    if (!template) throw new ApiError("Email template not found", 404);
    return NextResponse.json(template);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const session = await requirePermission(req, "emailTemplates.update");
    const { id } = await params;
    const body = await req.json();
    const parsed = emailTemplateUpdateSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const template = await updateEmailTemplate(id, parsed.data, session.user.id);
    return NextResponse.json(template);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const session = await requirePermission(req, "emailTemplates.delete");
    const { id } = await params;
    await deleteEmailTemplate(id, session.user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
