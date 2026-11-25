import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { getLeadById, updateLead, deleteLead } from "@/lib/services/leadService";
import { leadUpdateSchema } from "@/lib/validation/lead";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, props: Params) {
  const params = await props.params;
  try {
    await requirePermission(req, "leads.view");
    const { id } = params;
    const lead = await getLeadById(id);
    if (!lead) throw new ApiError("Lead not found", 404);
    return NextResponse.json(lead);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function PATCH(req: Request, props: Params) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "leads.update");
    const { id } = params;
    const body = await req.json();
    const parsed = leadUpdateSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const lead = await updateLead(id, parsed.data, session.user.id);
    return NextResponse.json(lead);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function DELETE(req: Request, props: Params) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "leads.delete");
    const { id } = params;
    await deleteLead(id, session.user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
