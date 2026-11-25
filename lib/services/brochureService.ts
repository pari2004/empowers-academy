import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { createRevision } from "@/lib/revisions";
import type { BrochureInput, BrochureUpdateInput } from "@/lib/validation/brochure";

const include = { category: true, course: { select: { id: true, title: true, slug: true } } } as const;

export type ListBrochureParams = {
  page?: number;
  pageSize?: number;
  status?: string;
  categoryId?: string;
  search?: string;
};

export async function listBrochures(params: ListBrochureParams = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where = {
    deletedAt: null,
    ...(params.status ? { status: params.status as never } : {}),
    ...(params.categoryId ? { categoryId: params.categoryId } : {}),
    ...(params.search ? { title: { contains: params.search, mode: "insensitive" as const } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.brochure.findMany({ where, orderBy: [{ order: "asc" }, { updatedAt: "desc" }], skip: (page - 1) * pageSize, take: pageSize, include }),
    prisma.brochure.count({ where }),
  ]);

  return { items, total, page, pageSize, pageCount: Math.ceil(total / pageSize) };
}

export function getBrochureById(id: string) {
  return prisma.brochure.findFirst({ where: { id, deletedAt: null }, include });
}

export function getPublishedBrochureBySlug(slug: string) {
  return prisma.brochure.findFirst({
    where: { slug, deletedAt: null, status: "PUBLISHED", publishedAt: { lte: new Date() } },
    include,
  });
}

export function getPublishedBrochures(params: { courseId?: string } = {}) {
  return prisma.brochure.findMany({
    where: {
      deletedAt: null,
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
      ...(params.courseId ? { courseId: params.courseId } : {}),
    },
    orderBy: [{ order: "asc" }, { publishedAt: "desc" }],
    include,
  });
}

export async function createBrochure(input: BrochureInput, actorId?: string | null) {
  const brochure = await prisma.brochure.create({
    data: {
      title: input.title,
      slug: input.slug,
      shortDescription: input.shortDescription,
      description: input.description,
      thumbnail: input.thumbnail,
      fileUrl: input.fileUrl,
      fileName: input.fileName,
      fileSize: input.fileSize,
      categoryId: input.categoryId,
      courseId: input.courseId,
      tags: input.tags,
      downloadButtonText: input.downloadButtonText || undefined,
      featured: input.featured,
      order: input.order,
      status: input.status,
      publishedAt: input.publishedAt ? new Date(input.publishedAt) : input.status === "PUBLISHED" ? new Date() : null,
      createdById: actorId ?? null,
      updatedById: actorId ?? null,
    },
    include,
  });

  await createRevision({ entityType: "brochure", entityId: brochure.id, data: brochure, createdById: actorId });
  await logActivity({ userId: actorId, action: "CREATE", entityType: "brochure", entityId: brochure.id });
  return brochure;
}

export async function updateBrochure(id: string, input: BrochureUpdateInput, actorId?: string | null) {
  const existing = await getBrochureById(id);
  if (!existing) throw new Error("Brochure not found");
  await createRevision({ entityType: "brochure", entityId: id, data: existing, createdById: actorId });

  const wasPublished = existing.status === "PUBLISHED";
  const willBePublished = input.status ? input.status === "PUBLISHED" : wasPublished;

  const brochure = await prisma.brochure.update({
    where: { id },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.slug !== undefined && { slug: input.slug }),
      ...(input.shortDescription !== undefined && { shortDescription: input.shortDescription }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.thumbnail !== undefined && { thumbnail: input.thumbnail }),
      ...(input.fileUrl !== undefined && { fileUrl: input.fileUrl }),
      ...(input.fileName !== undefined && { fileName: input.fileName }),
      ...(input.fileSize !== undefined && { fileSize: input.fileSize }),
      ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
      ...(input.courseId !== undefined && { courseId: input.courseId }),
      ...(input.tags !== undefined && { tags: input.tags }),
      ...(input.downloadButtonText !== undefined && { downloadButtonText: input.downloadButtonText }),
      ...(input.featured !== undefined && { featured: input.featured }),
      ...(input.order !== undefined && { order: input.order }),
      ...(input.status !== undefined && { status: input.status }),
      publishedAt: input.publishedAt
        ? new Date(input.publishedAt)
        : !wasPublished && willBePublished
          ? new Date()
          : undefined,
      version: { increment: 1 },
      updatedById: actorId ?? null,
    },
    include,
  });

  await logActivity({ userId: actorId, action: "UPDATE", entityType: "brochure", entityId: id });
  return brochure;
}

export async function deleteBrochure(id: string, actorId?: string | null) {
  await prisma.brochure.update({ where: { id }, data: { deletedAt: new Date(), updatedById: actorId ?? null } });
  await logActivity({ userId: actorId, action: "DELETE", entityType: "brochure", entityId: id });
}

export function listBrochureCategories() {
  return prisma.brochureCategory.findMany({ orderBy: { name: "asc" } });
}

function slugify(input: string): string {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function createBrochureCategory(name: string) {
  return prisma.brochureCategory.create({ data: { name, slug: slugify(name) } });
}
