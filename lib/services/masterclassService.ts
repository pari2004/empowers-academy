import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import type { MasterclassInput, MasterclassUpdateInput } from "@/lib/validation/masterclass";

export async function listMasterclasses() {
  return prisma.masterclass.findMany({
    where: { deletedAt: null },
    include: { instructor: { select: { id: true, name: true } }, course: { select: { id: true, title: true } } },
    orderBy: { scheduledAt: "desc" },
  });
}

export function getMasterclassById(id: string) {
  return prisma.masterclass.findFirst({ where: { id, deletedAt: null } });
}

export async function createMasterclass(input: MasterclassInput, actorId?: string | null) {
  const masterclass = await prisma.masterclass.create({
    data: {
      title: input.title,
      slug: input.slug,
      description: input.description,
      coverImage: input.coverImage,
      instructorId: input.instructorId,
      courseId: input.courseId,
      scheduledAt: new Date(input.scheduledAt),
      durationMinutes: input.durationMinutes,
      meetingLink: input.meetingLink,
      capacity: input.capacity,
      status: input.status,
      createdById: actorId ?? null,
      updatedById: actorId ?? null,
    },
  });
  await logActivity({ userId: actorId, action: "CREATE", entityType: "masterclass", entityId: masterclass.id });
  return masterclass;
}

export async function updateMasterclass(id: string, input: MasterclassUpdateInput, actorId?: string | null) {
  const data = {
    ...(input.title !== undefined && { title: input.title }),
    ...(input.slug !== undefined && { slug: input.slug }),
    ...(input.description !== undefined && { description: input.description }),
    ...(input.coverImage !== undefined && { coverImage: input.coverImage }),
    ...(input.instructorId !== undefined && { instructorId: input.instructorId }),
    ...(input.courseId !== undefined && { courseId: input.courseId }),
    ...(input.scheduledAt !== undefined && { scheduledAt: new Date(input.scheduledAt) }),
    ...(input.durationMinutes !== undefined && { durationMinutes: input.durationMinutes }),
    ...(input.meetingLink !== undefined && { meetingLink: input.meetingLink }),
    ...(input.capacity !== undefined && { capacity: input.capacity }),
    ...(input.status !== undefined && { status: input.status }),
  };

  const masterclass = await prisma.masterclass.update({
    where: { id },
    data: { ...data, updatedById: actorId ?? null },
  });
  await logActivity({ userId: actorId, action: "UPDATE", entityType: "masterclass", entityId: id });
  return masterclass;
}

export async function deleteMasterclass(id: string, actorId?: string | null) {
  await prisma.masterclass.update({ where: { id }, data: { deletedAt: new Date(), updatedById: actorId ?? null } });
  await logActivity({ userId: actorId, action: "DELETE", entityType: "masterclass", entityId: id });
}

// Public, select-only read for the /masterclasses listing page.
export function getUpcomingMasterclasses() {
  return prisma.masterclass.findMany({
    where: { deletedAt: null, status: "PUBLISHED", scheduledAt: { gte: new Date() } },
    orderBy: { scheduledAt: "asc" },
    select: {
      slug: true,
      title: true,
      description: true,
      coverImage: true,
      scheduledAt: true,
      durationMinutes: true,
      capacity: true,
      instructor: { select: { name: true, designation: true, profileImage: true } },
      course: { select: { slug: true, title: true } },
    },
  });
}

// Public, select-only read for the /masterclasses/[slug] landing page and its
// thank-you page — no date filter, so a registrant can still open their
// confirmation/join link after the event has started.
export function getMasterclassBySlug(slug: string) {
  return prisma.masterclass.findFirst({
    where: { slug, deletedAt: null, status: "PUBLISHED" },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      coverImage: true,
      scheduledAt: true,
      durationMinutes: true,
      meetingLink: true,
      capacity: true,
      instructor: { select: { name: true, designation: true, bio: true, profileImage: true } },
      course: { select: { slug: true, title: true } },
    },
  });
}
