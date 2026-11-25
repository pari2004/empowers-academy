import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { listLeads, createLead } from "@/lib/services/leadService";
import { leadSchema } from "@/lib/validation/lead";

export async function GET(req: Request) {
  try {
    await requirePermission(req, "leads.view");
    const { searchParams } = new URL(req.url);
    const result = await listLeads({
      page: Number(searchParams.get("page") ?? 1),
      pageSize: Number(searchParams.get("pageSize") ?? 20),
      stage: (searchParams.get("stage") as never) ?? undefined,
      source: (searchParams.get("source") as never) ?? undefined,
      assignedToId: searchParams.get("assignedToId") ?? undefined,
      search: searchParams.get("search") ?? undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requirePermission(req, "leads.create");
    const body = await req.json();
    const parsed = leadSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const lead = await createLead(parsed.data, session.user.id);
    return NextResponse.json(lead, { status: 201 });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
