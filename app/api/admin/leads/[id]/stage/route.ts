import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { can } from "@/lib/rbac";
import { transitionStage } from "@/lib/services/leadService";
import { leadStageTransitionSchema } from "@/lib/validation/lead";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, props: Params) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "leads.update");
    const { id } = params;
    const body = await req.json();
    const parsed = leadStageTransitionSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    // PARTIAL_PAYMENT/ONBOARDED_LEARNER create a Student and/or record a
    // Payment as a side effect of the transition — require the permissions
    // those writes would normally need, on top of leads.update.
    if (parsed.data.stage === "PARTIAL_PAYMENT") {
      if (!can(session, "students.create")) throw new ApiError('Forbidden: missing permission "students.create"', 403);
      if (!can(session, "payments.create")) throw new ApiError('Forbidden: missing permission "payments.create"', 403);
    }
    if (parsed.data.stage === "ONBOARDED_LEARNER") {
      if (!can(session, "students.create")) throw new ApiError('Forbidden: missing permission "students.create"', 403);
      if (parsed.data.payment && !can(session, "payments.create")) {
        throw new ApiError('Forbidden: missing permission "payments.create"', 403);
      }
    }

    const lead = await transitionStage(id, parsed.data, session.user.id);
    return NextResponse.json(lead);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
