import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { ALLOWED_MIME_TYPES, MAX_UPLOAD_BYTES, createPresignedUploadUrl, publicUrlFor, isS3Configured } from "@/lib/s3";

const bodySchema = z.object({
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().int().positive(),
});

export async function POST(req: Request) {
  try {
    await requirePermission(req, "media.create");

    if (!isS3Configured()) {
      throw new ApiError(
        "Media storage isn't configured yet. Set S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, and S3_BUCKET.",
        503
      );
    }

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) throw new ApiError("Invalid input", 422);
    const { filename, mimeType, size } = parsed.data;

    if (!ALLOWED_MIME_TYPES.includes(mimeType)) throw new ApiError(`File type "${mimeType}" is not allowed`, 422);
    if (size > MAX_UPLOAD_BYTES) throw new ApiError("File exceeds the 50MB upload limit", 422);

    const safeName = filename.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const key = `uploads/${Date.now()}-${safeName}`;

    const uploadUrl = await createPresignedUploadUrl(key, mimeType);
    const publicUrl = publicUrlFor(key);

    return NextResponse.json({ uploadUrl, publicUrl, key });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
