import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { listMedia, registerUploadedFile } from "@/lib/services/mediaService";
import { linkUrl } from "@/lib/validation/url";

const registerSchema = z.object({
  filename: z.string().min(1),
  // Uploads are served from /api/media/..., which z.string().url() rejects.
  url: linkUrl,
  mimeType: z.string().min(1),
  size: z.number().int().positive(),
  folderId: z.string().uuid().optional().nullable(),
  altText: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    await requirePermission(req, "media.view");
    const { searchParams } = new URL(req.url);
    const items = await listMedia({
      folderId: searchParams.get("folderId") ?? undefined,
      search: searchParams.get("search") ?? undefined,
    });
    return NextResponse.json({ items });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

// Called by the browser after it has PUT the file directly to S3 using the
// presigned URL from /api/admin/media/presign — this just records the metadata.
export async function POST(req: Request) {
  try {
    const session = await requirePermission(req, "media.create");
    const parsed = registerSchema.safeParse(await req.json());
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const file = await registerUploadedFile({ ...parsed.data, actorId: session.user.id });
    return NextResponse.json(file, { status: 201 });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
