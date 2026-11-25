import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { listEmails, sendEmail } from "@/lib/services/emailService";
import { sendEmailSchema, emailListQuerySchema } from "@/lib/validation/email";

export async function GET(req: Request) {
  try {
    await requirePermission(req, "communications.view");
    const { searchParams } = new URL(req.url);
    const parsed = emailListQuerySchema.safeParse({
      page: Number(searchParams.get("page") ?? 1),
      pageSize: Number(searchParams.get("pageSize") ?? 20),
      status: searchParams.get("status") ?? undefined,
      entityType: searchParams.get("entityType") ?? undefined,
      entityId: searchParams.get("entityId") ?? undefined,
      search: searchParams.get("search") ?? undefined,
    });
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid query", 422);

    const result = await listEmails(parsed.data);
    return NextResponse.json(result);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requirePermission(req, "communications.create");
    const body = await req.json();
    const parsed = sendEmailSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const log = await sendEmail(
      {
        templateId: parsed.data.templateId,
        to: parsed.data.to,
        toName: parsed.data.toName,
        subject: parsed.data.subject,
        bodyHtml: parsed.data.bodyHtml,
        ccEmails: parsed.data.ccEmails,
        bccEmails: parsed.data.bccEmails,
        attachments: parsed.data.attachments,
        scheduledAt: parsed.data.scheduledAt,
        templateVariables: parsed.data.templateVariables,
        isDraft: parsed.data.isDraft,
        leadId: parsed.data.leadId,
        studentId: parsed.data.studentId,
        entityType: parsed.data.entityType,
        entityId: parsed.data.entityId,
      },
      session.user.id
    );

    return NextResponse.json(log, { status: 201 });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
