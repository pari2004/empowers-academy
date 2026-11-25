import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { createRevision } from "@/lib/revisions";
import type { CourseInput, CourseUpdateInput } from "@/lib/validation/course";
import type { ContentStatus } from "@prisma/client";

const include = {
  instructors: { include: { instructor: true } },
  curriculum: { include: { lessons: { orderBy: { order: "asc" as const } } }, orderBy: { order: "asc" as const } },
  faqs: { orderBy: { order: "asc" as const } },
} as const;

// Same shape as `include`, but hides instructor links whose instructor was
// soft-deleted or unpublished after being assigned to the course — admin
// views use `include` so stale links stay visible for cleanup, public views
// use this so removed/unpublished mentors disappear immediately.
const publicInclude = {
  ...include,
  instructors: {
    where: { instructor: { deletedAt: null, status: "PUBLISHED" as const } },
    include: { instructor: true },
  },
} as const;

export type ListCoursesParams = {
  page?: number;
  pageSize?: number;
  status?: ContentStatus;
  search?: string;
};

export async function listCourses(params: ListCoursesParams = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where = {
    deletedAt: null,
    ...(params.status ? { status: params.status } : {}),
    ...(params.search
      ? { title: { contains: params.search, mode: "insensitive" as const } }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.course.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include,
    }),
    prisma.course.count({ where }),
  ]);

  return { items, total, page, pageSize, pageCount: Math.ceil(total / pageSize) };
}

export function getCourseById(id: string) {
  return prisma.course.findFirst({ where: { id, deletedAt: null }, include });
}

export function getPublishedCourseBySlug(slug: string) {
  return prisma.course.findFirst({
    where: { slug, deletedAt: null, status: "PUBLISHED" },
    include: publicInclude,
  });
}

export function getPublishedCourses() {
  return prisma.course.findMany({
    where: { deletedAt: null, status: "PUBLISHED", publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    include: publicInclude,
  });
}

// Public, select-only read for the compare-programs tool — never `include`
// the full course record (avoids leaking admin-only fields).
export async function getCoursesForComparison(rawSlugs: string[]) {
  const slugs = Array.from(new Set(rawSlugs));
  if (slugs.length === 0) return [];
  const courses = await prisma.course.findMany({
    where: { slug: { in: slugs }, deletedAt: null, status: "PUBLISHED" },
    select: {
      slug: true,
      title: true,
      thumbnail: true,
      category: true,
      duration: true,
      level: true,
      price: true,
      discountPrice: true,
      tags: true,
      programmeDetail: {
        where: { deletedAt: null, status: "PUBLISHED" },
        select: {
          mode: true,
          certification: true,
          placementSupport: true,
          emiAvailable: true,
          placementRate: true,
          avgSalaryHikePct: true,
          avgPackageLpa: true,
        },
      },
    },
  });
  // `findMany` doesn't preserve `slugs` order — re-sort so the comparison
  // table's column order matches what the user actually picked.
  const bySlug = new Map(courses.map((c) => [c.slug, c]));
  return slugs.map((slug) => bySlug.get(slug)).filter((c): c is (typeof courses)[number] => !!c);
}

// Lean option list for the compare-programs picker — just enough to render
// checkboxes, not a full course fetch.
export function listPublishedCourseOptions() {
  return prisma.course.findMany({
    where: { deletedAt: null, status: "PUBLISHED" },
    select: { slug: true, title: true, category: true },
    orderBy: { title: "asc" },
  });
}

export async function getCourseStats() {
  const [total, published, draft] = await Promise.all([
    prisma.course.count({ where: { deletedAt: null } }),
    prisma.course.count({ where: { deletedAt: null, status: "PUBLISHED" } }),
    prisma.course.count({ where: { deletedAt: null, status: "DRAFT" } }),
  ]);
  return { total, published, draft };
}

export async function createCourse(input: CourseInput, actorId?: string | null) {
  const course = await prisma.$transaction(async (tx) => {
    const created = await tx.course.create({
      data: {
        title: input.title,
        slug: input.slug,
        category: input.category,
        description: input.description,
        shortDescription: input.shortDescription,
        thumbnail: input.thumbnail,
        coverImage: input.coverImage,
        duration: input.duration,
        level: input.level,
        language: input.language,
        price: input.price,
        discountPrice: input.discountPrice,
        tags: input.tags,
        learningOutcomes: input.learningOutcomes,
        requirements: input.requirements,
        toolsCovered: input.toolsCovered,
        status: input.status,
        publishedAt: input.status === "PUBLISHED" ? new Date() : null,
        createdById: actorId ?? null,
        updatedById: actorId ?? null,
        instructors: {
          create: input.instructorIds.map((instructorId) => ({ instructorId })),
        },
        curriculum: {
          create: input.curriculum.map((section) => ({
            title: section.title,
            order: section.order,
            lessons: { create: section.lessons.map((l) => ({ title: l.title, duration: l.duration, order: l.order })) },
          })),
        },
      },
      include,
    });
    return created;
  });

  await createRevision({ entityType: "course", entityId: course.id, data: course, createdById: actorId });
  await logActivity({ userId: actorId, action: "CREATE", entityType: "course", entityId: course.id });
  return course;
}

export async function updateCourse(id: string, input: CourseUpdateInput, actorId?: string | null) {
  const existing = await getCourseById(id);
  if (!existing) throw new Error("Course not found");

  await createRevision({ entityType: "course", entityId: id, data: existing, createdById: actorId });

  const wasPublished = existing.status === "PUBLISHED";
  const willBePublished = input.status ? input.status === "PUBLISHED" : wasPublished;

  const updated = await prisma.$transaction(async (tx) => {
    if (input.instructorIds) {
      await tx.courseInstructor.deleteMany({ where: { courseId: id } });
    }
    if (input.curriculum) {
      await tx.courseCurriculumSection.deleteMany({ where: { courseId: id } });
    }

    return tx.course.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.slug !== undefined && { slug: input.slug }),
        ...(input.category !== undefined && { category: input.category }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.shortDescription !== undefined && { shortDescription: input.shortDescription }),
        ...(input.thumbnail !== undefined && { thumbnail: input.thumbnail }),
        ...(input.coverImage !== undefined && { coverImage: input.coverImage }),
        ...(input.duration !== undefined && { duration: input.duration }),
        ...(input.level !== undefined && { level: input.level }),
        ...(input.language !== undefined && { language: input.language }),
        ...(input.price !== undefined && { price: input.price }),
        ...(input.discountPrice !== undefined && { discountPrice: input.discountPrice }),
        ...(input.tags !== undefined && { tags: input.tags }),
        ...(input.learningOutcomes !== undefined && { learningOutcomes: input.learningOutcomes }),
        ...(input.requirements !== undefined && { requirements: input.requirements }),
        ...(input.toolsCovered !== undefined && { toolsCovered: input.toolsCovered }),
        ...(input.status !== undefined && { status: input.status }),
        publishedAt: !wasPublished && willBePublished ? new Date() : undefined,
        version: { increment: 1 },
        updatedById: actorId ?? null,
        ...(input.instructorIds && {
          instructors: { create: input.instructorIds.map((instructorId) => ({ instructorId })) },
        }),
        ...(input.curriculum && {
          curriculum: {
            create: input.curriculum.map((section) => ({
              title: section.title,
              order: section.order,
              lessons: {
                create: section.lessons.map((l) => ({ title: l.title, duration: l.duration, order: l.order })),
              },
            })),
          },
        }),
      },
      include,
    });
  });

  await logActivity({ userId: actorId, action: "UPDATE", entityType: "course", entityId: id });
  return updated;
}

export async function publishCourse(id: string, actorId?: string | null) {
  const course = await updateCourse(id, { status: "PUBLISHED" }, actorId);
  await logActivity({ userId: actorId, action: "PUBLISH", entityType: "course", entityId: id });
  return course;
}

export async function archiveCourse(id: string, actorId?: string | null) {
  const course = await updateCourse(id, { status: "ARCHIVED" }, actorId);
  await logActivity({ userId: actorId, action: "ARCHIVE", entityType: "course", entityId: id });
  return course;
}

export async function deleteCourse(id: string, actorId?: string | null) {
  await prisma.course.update({ where: { id }, data: { deletedAt: new Date(), updatedById: actorId ?? null } });
  await logActivity({ userId: actorId, action: "DELETE", entityType: "course", entityId: id });
}

export async function duplicateCourse(id: string, actorId?: string | null) {
  const source = await getCourseById(id);
  if (!source) throw new Error("Course not found");

  const slug = `${source.slug}-copy-${Date.now().toString(36)}`;
  const duplicate = await createCourse(
    {
      title: `${source.title} (Copy)`,
      slug,
      category: source.category ?? undefined,
      description: source.description,
      shortDescription: source.shortDescription ?? undefined,
      thumbnail: source.thumbnail ?? undefined,
      coverImage: source.coverImage ?? undefined,
      duration: source.duration ?? undefined,
      level: source.level,
      language: source.language,
      price: source.price ? Number(source.price) : undefined,
      discountPrice: source.discountPrice ? Number(source.discountPrice) : undefined,
      tags: source.tags,
      learningOutcomes: source.learningOutcomes,
      requirements: source.requirements,
      toolsCovered: source.toolsCovered,
      status: "DRAFT",
      instructorIds: source.instructors.map((ci) => ci.instructorId),
      curriculum: source.curriculum.map((section) => ({
        title: section.title,
        order: section.order,
        lessons: section.lessons.map((l) => ({ title: l.title, duration: l.duration ?? undefined, order: l.order })),
      })),
    },
    actorId
  );

  await logActivity({ userId: actorId, action: "DUPLICATE", entityType: "course", entityId: duplicate.id, metadata: { sourceId: id } });
  return duplicate;
}
