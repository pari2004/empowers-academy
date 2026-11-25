import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { listLeadNotes, addLeadNote } from "@/lib/services/leadService";
import { leadNoteSchema } from "@/lib/validation/lead";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, props: Params) {
  const params = await props.params;
  try {
    await requirePermission(req, "leads.view");
    const notes = await listLeadNotes(params.id);
    return NextResponse.json(notes);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function POST(req: Request, props: Params) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "leads.update");
    const body = await req.json();
    const parsed = leadNoteSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const note = await addLeadNote(params.id, parsed.data, session.user.id);
    return NextResponse.json(note, { status: 201 });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
