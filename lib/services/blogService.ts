import { prisma, type PrismaTransactionClient } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { createRevision } from "@/lib/revisions";
import type { BlogInput, BlogUpdateInput } from "@/lib/validation/blog";
import type { Block } from "@/lib/resources";

const include = { category: true, tags: { include: { tag: true } } } as const;

function computeReadingTime(body: Block[]): string {
  const words = body
    .map((b) => ("text" in b ? b.text : "items" in b ? b.items.join(" ") : "code" in b ? b.code : ""))
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

export type ListBlogParams = { page?: number; pageSize?: number; status?: string; search?: string };

export async function listBlogs(params: ListBlogParams = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where = {
    deletedAt: null,
    ...(params.status ? { status: params.status as never } : {}),
    ...(params.search ? { title: { contains: params.search, mode: "insensitive" as const } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.blog.findMany({ where, orderBy: { updatedAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize, include }),
    prisma.blog.count({ where }),
  ]);

  return { items, total, page, pageSize, pageCount: Math.ceil(total / pageSize) };
}

export function getBlogById(id: string) {
  return prisma.blog.findFirst({ where: { id, deletedAt: null }, include });
}

export function getPublishedBlogBySlug(slug: string) {
  return prisma.blog.findFirst({
    where: { slug, deletedAt: null, status: "PUBLISHED", publishedAt: { lte: new Date() } },
    include,
  });
}

export function getPublishedBlogs() {
  return prisma.blog.findMany({
    where: { deletedAt: null, status: "PUBLISHED", publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    include,
  });
}

async function syncTags(blogId: string, tagIds: string[] | undefined, tx: PrismaTransactionClient) {
  if (!tagIds) return;
  await tx.blogTagOnBlog.deleteMany({ where: { blogId } });
  if (tagIds.length) {
    await tx.blogTagOnBlog.createMany({ data: tagIds.map((tagId) => ({ blogId, tagId })) });
  }
}

export async function createBlog(input: BlogInput, actorId?: string | null) {
  const blog = await prisma.$transaction(async (tx) => {
    const created = await tx.blog.create({
      data: {
        title: input.title,
        slug: input.slug,
        excerpt: input.excerpt,
        featuredImage: input.featuredImage,
        body: input.body as never,
        categoryId: input.categoryId,
        readingTime: input.readingTime || computeReadingTime(input.body),
        status: input.status,
        publishedAt: input.publishedAt ? new Date(input.publishedAt) : input.status === "PUBLISHED" ? new Date() : null,
        createdById: actorId ?? null,
        updatedById: actorId ?? null,
      },
      include,
    });
    await syncTags(created.id, input.tagIds, tx);
    return created;
  });

  await createRevision({ entityType: "blog", entityId: blog.id, data: blog, createdById: actorId });
  await logActivity({ userId: actorId, action: "CREATE", entityType: "blog", entityId: blog.id });
  return blog;
}

export async function updateBlog(id: string, input: BlogUpdateInput, actorId?: string | null) {
  const existing = await getBlogById(id);
  if (!existing) throw new Error("Blog not found");
  await createRevision({ entityType: "blog", entityId: id, data: existing, createdById: actorId });

  const wasPublished = existing.status === "PUBLISHED";
  const willBePublished = input.status ? input.status === "PUBLISHED" : wasPublished;

  const blog = await prisma.$transaction(async (tx) => {
    const updated = await tx.blog.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.slug !== undefined && { slug: input.slug }),
        ...(input.excerpt !== undefined && { excerpt: input.excerpt }),
        ...(input.featuredImage !== undefined && { featuredImage: input.featuredImage }),
        ...(input.body !== undefined && { body: input.body as never, readingTime: input.readingTime || computeReadingTime(input.body) }),
        ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
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
    await syncTags(id, input.tagIds, tx);
    return updated;
  });

  await logActivity({ userId: actorId, action: "UPDATE", entityType: "blog", entityId: id });
  return blog;
}

export async function deleteBlog(id: string, actorId?: string | null) {
  await prisma.blog.update({ where: { id }, data: { deletedAt: new Date(), updatedById: actorId ?? null } });
  await logActivity({ userId: actorId, action: "DELETE", entityType: "blog", entityId: id });
}

export function listBlogCategories() {
  return prisma.blogCategory.findMany({ orderBy: { name: "asc" } });
}

export function listBlogTags() {
  return prisma.blogTag.findMany({ orderBy: { name: "asc" } });
}

function slugify(input: string): string {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function createBlogCategory(name: string) {
  return prisma.blogCategory.create({ data: { name, slug: slugify(name) } });
}

export async function createBlogTag(name: string) {
  return prisma.blogTag.create({ data: { name, slug: slugify(name) } });
}
