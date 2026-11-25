import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { deleteObject, keyFromUrl, isS3Configured } from "@/lib/s3";

export type ListMediaParams = { folderId?: string | null; search?: string };

export function listMedia(params: ListMediaParams = {}) {
  return prisma.mediaFile.findMany({
    where: {
      deletedAt: null,
      ...(params.folderId !== undefined ? { folderId: params.folderId } : {}),
      ...(params.search ? { filename: { contains: params.search, mode: "insensitive" as const } } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
}

export function listFolders() {
  return prisma.mediaFolder.findMany({ orderBy: { name: "asc" } });
}

export async function createFolder(name: string, parentId?: string | null) {
  return prisma.mediaFolder.create({ data: { name, parentId } });
}

export async function registerUploadedFile(input: {
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  folderId?: string | null;
  altText?: string;
  actorId?: string | null;
}) {
  const file = await prisma.mediaFile.create({
    data: {
      filename: input.filename,
      url: input.url,
      mimeType: input.mimeType,
      size: input.size,
      folderId: input.folderId ?? null,
      altText: input.altText,
      createdById: input.actorId ?? null,
    },
  });
  await logActivity({ userId: input.actorId, action: "CREATE", entityType: "media", entityId: file.id });
  return file;
}

export async function updateMedia(id: string, input: { altText?: string; folderId?: string | null }, actorId?: string | null) {
  const file = await prisma.mediaFile.update({ where: { id }, data: input });
  await logActivity({ userId: actorId, action: "UPDATE", entityType: "media", entityId: id });
  return file;
}

export async function deleteMedia(id: string, actorId?: string | null) {
  const file = await prisma.mediaFile.findUnique({ where: { id } });
  if (!file) return;

  if (isS3Configured()) {
    try {
      await deleteObject(keyFromUrl(file.url));
    } catch (err) {
      console.error("Failed to delete S3 object", err);
    }
  }

  await prisma.mediaFile.update({ where: { id }, data: { deletedAt: new Date() } });
  await logActivity({ userId: actorId, action: "DELETE", entityType: "media", entityId: id });
}
