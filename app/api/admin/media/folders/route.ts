import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { listFolders, createFolder } from "@/lib/services/mediaService";

const bodySchema = z.object({ name: z.string().min(1), parentId: z.string().uuid().optional().nullable() });

export async function GET(req: Request) {
  try {
    await requirePermission(req, "media.view");
    const items = await listFolders();
    return NextResponse.json({ items });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    await requirePermission(req, "media.create");
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) throw new ApiError("Invalid input", 422);
    const folder = await createFolder(parsed.data.name, parsed.data.parentId);
    return NextResponse.json(folder, { status: 201 });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
