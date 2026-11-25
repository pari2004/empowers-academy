import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { isReportType, getReportData } from "@/lib/services/financeReportDispatch";

type Params = { params: Promise<{ type: string }> };

export async function GET(req: Request, props: Params) {
  const params = await props.params;
  try {
    await requirePermission(req, "financeReports.view");
    if (!isReportType(params.type)) throw new ApiError("Unknown report type", 404);

    const { searchParams } = new URL(req.url);
    const data = await getReportData(params.type, searchParams);
    return NextResponse.json(data);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
