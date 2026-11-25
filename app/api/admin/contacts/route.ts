import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse } from "@/lib/api-guard";
import { listEnquiries } from "@/lib/services/contactService";

export async function GET(req: Request) {
  try {
    await requirePermission(req, "contacts.view");
    const { searchParams } = new URL(req.url);
    const result = await listEnquiries({
      page: Number(searchParams.get("page") ?? 1),
      pageSize: Number(searchParams.get("pageSize") ?? 20),
      status: searchParams.get("status") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      enquiryType: searchParams.get("enquiryType") ?? undefined,
      companyType: searchParams.get("companyType") ?? undefined,
      lookingFor: searchParams.get("lookingFor") ?? undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
