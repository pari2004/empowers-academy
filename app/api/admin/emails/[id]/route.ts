import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { getEmailById } from "@/lib/services/emailService";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  try {
    await requirePermission(req, "communications.view");
    const { id } = await params;
    const email = await getEmailById(id);
    if (!email) throw new ApiError("Email not found", 404);
    return NextResponse.json(email);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
