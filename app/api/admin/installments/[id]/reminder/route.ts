import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { getInstallmentById } from "@/lib/services/installmentService";
import { sendInstallmentReminder } from "@/lib/services/reminderService";

const bodySchema = z.object({ type: z.enum(["UPCOMING", "OVERDUE", "FINAL"]).optional() });

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, props: Params) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "installments.update");
    const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const installment = await getInstallmentById(params.id);
    if (!installment) throw new ApiError("Installment not found", 404);

    const type = parsed.data.type ?? (installment.status === "OVERDUE" ? "OVERDUE" : "UPCOMING");
    const updated = await sendInstallmentReminder(params.id, type, session.user.id);
    return NextResponse.json(updated);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
