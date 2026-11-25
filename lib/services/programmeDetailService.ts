import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { createRevision } from "@/lib/revisions";
import type { ProgrammeDetailUpdateInput } from "@/lib/validation/programmeDetail";

const courseSelect = { id: true, title: true, slug: true, thumbnail: true, category: true, status: true } as const;

export async function listCoursesWithProgrammeDetail(params: { search?: string } = {}) {
  return prisma.course.findMany({
    where: {
      deletedAt: null,
      ...(params.search ? { title: { contains: params.search, mode: "insensitive" as const } } : {}),
    },
    select: { ...courseSelect, programmeDetail: { select: { status: true, updatedAt: true } } },
    orderBy: { updatedAt: "desc" },
  });
}

export function getProgrammeDetailByCourseId(courseId: string) {
  return prisma.programmeDetail.findFirst({
    where: { courseId, deletedAt: null },
    include: { course: { select: courseSelect } },
  });
}

export function getPublishedProgrammeDetailBySlug(courseSlug: string) {
  return prisma.course.findFirst({
    where: { slug: courseSlug, deletedAt: null, status: "PUBLISHED" },
    include: {
      instructors: {
        where: { instructor: { deletedAt: null, status: "PUBLISHED" } },
        include: { instructor: true },
      },
      curriculum: { include: { lessons: { orderBy: { order: "asc" as const } } }, orderBy: { order: "asc" as const } },
      faqs: { where: { deletedAt: null, status: "PUBLISHED" }, orderBy: { order: "asc" as const } },
      programmeDetail: { where: { deletedAt: null, status: "PUBLISHED" } },
    },
  });
}

export async function upsertProgrammeDetail(courseId: string, input: ProgrammeDetailUpdateInput, actorId?: string | null) {
  const existing = await prisma.programmeDetail.findFirst({ where: { courseId, deletedAt: null } });

  const wasPublished = existing?.status === "PUBLISHED";
  const willBePublished = input.status ? input.status === "PUBLISHED" : wasPublished;

  const data = {
    ...(input.heroBanner !== undefined && { heroBanner: input.heroBanner }),
    ...(input.heroImage !== undefined && { heroImage: input.heroImage }),
    ...(input.mode !== undefined && { mode: input.mode }),
    ...(input.eligibility !== undefined && { eligibility: input.eligibility }),
    ...(input.certification !== undefined && { certification: input.certification }),
    ...(input.emiAvailable !== undefined && { emiAvailable: input.emiAvailable }),
    ...(input.emiDetails !== undefined && { emiDetails: input.emiDetails }),
    ...(input.scholarshipInfo !== undefined && { scholarshipInfo: input.scholarshipInfo }),
    ...(input.admissionOpen !== undefined && { admissionOpen: input.admissionOpen }),
    ...(input.overview !== undefined && { overview: input.overview }),
    ...(input.highlights !== undefined && { highlights: input.highlights }),
    ...(input.careerOpportunities !== undefined && { careerOpportunities: input.careerOpportunities }),
    ...(input.placementSupport !== undefined && { placementSupport: input.placementSupport }),
    ...(input.placementRate !== undefined && { placementRate: input.placementRate }),
    ...(input.avgSalaryHikePct !== undefined && { avgSalaryHikePct: input.avgSalaryHikePct }),
    ...(input.avgPackageLpa !== undefined && { avgPackageLpa: input.avgPackageLpa }),
    ...(input.projects !== undefined && { projects: input.projects as never }),
    ...(input.galleryImages !== undefined && { galleryImages: input.galleryImages }),
    ...(input.videoUrl !== undefined && { videoUrl: input.videoUrl }),
    ...(input.curriculumUrl !== undefined && { curriculumUrl: input.curriculumUrl }),
    ...(input.applyCtaLabel !== undefined && { applyCtaLabel: input.applyCtaLabel }),
    ...(input.applyCtaHref !== undefined && { applyCtaHref: input.applyCtaHref }),
    ...(input.status !== undefined && { status: input.status }),
  };

  if (existing) {
    await createRevision({ entityType: "programmeDetail", entityId: existing.id, data: existing, createdById: actorId });
  }

  const record = await prisma.programmeDetail.upsert({
    where: { courseId },
    update: {
      ...data,
      publishedAt: input.publishedAt
        ? new Date(input.publishedAt)
        : !wasPublished && willBePublished
          ? new Date()
          : undefined,
      version: { increment: 1 },
      updatedById: actorId ?? null,
    },
    create: {
      courseId,
      ...data,
      publishedAt: input.publishedAt ? new Date(input.publishedAt) : willBePublished ? new Date() : null,
      createdById: actorId ?? null,
      updatedById: actorId ?? null,
    },
    include: { course: { select: courseSelect } },
  });

  await logActivity({
    userId: actorId,
    action: existing ? "UPDATE" : "CREATE",
    entityType: "programmeDetail",
    entityId: record.id,
  });
  return record;
}

export async function deleteProgrammeDetail(courseId: string, actorId?: string | null) {
  const existing = await prisma.programmeDetail.findFirst({ where: { courseId, deletedAt: null } });
  if (!existing) return;
  await prisma.programmeDetail.update({ where: { id: existing.id }, data: { deletedAt: new Date(), updatedById: actorId ?? null } });
  await logActivity({ userId: actorId, action: "DELETE", entityType: "programmeDetail", entityId: existing.id });
}
