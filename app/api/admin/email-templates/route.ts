import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { listEmailTemplates, createEmailTemplate } from "@/lib/services/emailTemplateService";
import { emailTemplateSchema } from "@/lib/validation/emailTemplate";

export async function GET(req: Request) {
  try {
    await requirePermission(req, "emailTemplates.view");
    const { searchParams } = new URL(req.url);
    const result = await listEmailTemplates({
      page: Number(searchParams.get("page") ?? 1),
      pageSize: Number(searchParams.get("pageSize") ?? 20),
      category: searchParams.get("category") ?? undefined,
      search: searchParams.get("search") ?? undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requirePermission(req, "emailTemplates.create");
    const body = await req.json();
    const parsed = emailTemplateSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const template = await createEmailTemplate(parsed.data, session.user.id);
    return NextResponse.json(template, { status: 201 });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
