import { NextResponse } from "next/server";
import { getObject, isS3Configured } from "@/lib/s3";
import fs from "fs";
import path from "path";

// Public read-through for uploaded media. Objects are streamed from S3 if configured,
// or served from local storage fallback when S3 is unavailable.
export async function GET(_req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key: keySegments } = await params;
  const key = keySegments.join("/");

  // Uploads live under "uploads/". Refusing anything else keeps this from
  // becoming a way to read arbitrary objects out of the bucket.
  if (!key.startsWith("uploads/") || key.includes("..")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const decodedKey = decodeURIComponent(key);
  const fileName = path.basename(decodedKey);
  const cleanName = fileName.replace(/^\d+-/, "");
  const localCandidates = [
    path.join(process.cwd(), "public", decodedKey),
    path.join(process.cwd(), "public", "uploads", fileName),
    path.join(process.cwd(), "public", "mentors", fileName),
    path.join(
      process.cwd(),
      "public",
      "mentors",
      cleanName.includes("yashwanth") ? "yashwanth.jpg" : cleanName.includes("abhishek") ? "abhishek.png" : cleanName
    ),
  ];

  for (const localPath of localCandidates) {
    if (fs.existsSync(localPath)) {
      const fileBuffer = fs.readFileSync(localPath);
      const ext = path.extname(localPath).toLowerCase();
      const contentType =
        ext === ".png"
          ? "image/png"
          : ext === ".jpg" || ext === ".jpeg"
            ? "image/jpeg"
            : "application/octet-stream";
      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=60, must-revalidate",
        },
      });
    }
  }

  if (isS3Configured()) {
    try {
      const object = await getObject(key);
      if (object.body) {
        const headers = new Headers();
        headers.set("Content-Type", object.contentType ?? "application/octet-stream");
        if (object.contentLength) headers.set("Content-Length", String(object.contentLength));
        if (object.etag) headers.set("ETag", object.etag);
        headers.set("Cache-Control", "public, max-age=60, must-revalidate");
        return new NextResponse(object.body, { headers });
      }
    } catch (err) {
      console.error("S3 error in media route:", err);
    }
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
