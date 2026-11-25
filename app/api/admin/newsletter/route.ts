import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { listSubscribers, importSubscribers } from "@/lib/services/newsletterService";

export async function GET(req: Request) {
  try {
    await requirePermission(req, "newsletter.view");
    const { searchParams } = new URL(req.url);
    const result = await listSubscribers({
      page: Number(searchParams.get("page") ?? 1),
      pageSize: Number(searchParams.get("pageSize") ?? 20),
      search: searchParams.get("search") ?? undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

const importSchema = z.object({ emails: z.array(z.string().email()) });

export async function POST(req: Request) {
  try {
    await requirePermission(req, "newsletter.create");
    const parsed = importSchema.safeParse(await req.json());
    if (!parsed.success) throw new ApiError("Invalid input", 422);
    const count = await importSubscribers(parsed.data.emails);
    return NextResponse.json({ imported: count });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
