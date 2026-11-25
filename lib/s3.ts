import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50MB

export function isS3Configured(): boolean {
  return !!(process.env.S3_ENDPOINT && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY && process.env.S3_BUCKET);
}

function getClient(): S3Client {
  return new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION || "auto",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true,
  });
}

export async function createPresignedUploadUrl(key: string, contentType: string): Promise<string> {
  const client = getClient();
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(client, command, { expiresIn: 300 });
}

// Media is served through /api/media/* rather than straight from the bucket.
// The storage provider keeps objects private — a public-read ACL is accepted
// but ignored, and bucket policies aren't implemented — so a direct bucket URL
// always 403s. Proxying also means the bucket can stay private.
export const MEDIA_ROUTE_PREFIX = "/api/media";

export function publicUrlFor(key: string): string {
  return `${MEDIA_ROUTE_PREFIX}/${key}`;
}

export async function getObject(key: string) {
  const client = getClient();
  const res = await client.send(
    new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key })
  );
  return {
    body: res.Body as ReadableStream | undefined,
    contentType: res.ContentType,
    contentLength: res.ContentLength,
    etag: res.ETag,
  };
}

export async function deleteObject(key: string): Promise<void> {
  const client = getClient();
  await client.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }));
}

export function keyFromUrl(url: string): string {
  if (url.startsWith(`${MEDIA_ROUTE_PREFIX}/`)) {
    return url.slice(MEDIA_ROUTE_PREFIX.length + 1);
  }
  // Rows written before media moved behind the proxy still hold a bucket URL.
  const base = process.env.S3_PUBLIC_URL?.replace(/\/$/, "") ?? "";
  return base && url.startsWith(base) ? url.slice(base.length + 1) : url;
}
