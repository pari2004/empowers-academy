import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import type { Resource } from "@/lib/rbac";

// Fields present in a revision snapshot that must never be written back verbatim
// on restore — either they're system-managed (id/timestamps/version/audit) or
// they're relation arrays whose snapshot shape doesn't match the update input
// shape (e.g. Course.instructors is CourseInstructor[] in a snapshot but
// instructorIds: string[] in the update payload). Restoring scalar fields is
// still a fully working, undoable restore; relations may need manual re-linking
// afterward for the most complex entities (Course, Blog).
const STRIP_KEYS = new Set([
  "id", "createdAt", "updatedAt", "deletedAt", "version", "createdById", "updatedById",
  "instructors", "curriculum", "tags", "category", "faqs", "views", "sections", "course",
]);

const ENTITY_MODEL = {
  course: "course",
  instructor: "instructor",
  blog: "blog",
  testimonial: "testimonial",
  faq: "faq",
  banner: "banner",
  pageSection: "pageSection",
  landingPage: "landingPage",
  brochure: "brochure",
  programmeDetail: "programmeDetail",
  aboutPage: "aboutPage",
} as const;

// The permission resource that guards restoring each entity type — same
// resource its own update endpoint requires, so "who can edit this" and
// "who can roll it back" stay in sync.
export const ENTITY_RESOURCE: Record<keyof typeof ENTITY_MODEL, Resource> = {
  course: "courses",
  instructor: "instructors",
  blog: "blog",
  testimonial: "testimonials",
  faq: "faqs",
  banner: "banners",
  pageSection: "homepage",
  landingPage: "landingPages",
  brochure: "brochures",
  programmeDetail: "programmeDetails",
  aboutPage: "aboutPage",
};

/** Looks up just the entityType for a revision, so callers can permission-check before restoring. */
export async function getRevisionEntityType(revisionId: string): Promise<string | null> {
  const revision = await prisma.revision.findUnique({ where: { id: revisionId }, select: { entityType: true } });
  return revision?.entityType ?? null;
}

export async function restoreRevision(revisionId: string, actorId?: string | null) {
  const revision = await prisma.revision.findUnique({ where: { id: revisionId } });
  if (!revision) throw new Error("Revision not found");

  const modelName = ENTITY_MODEL[revision.entityType as keyof typeof ENTITY_MODEL];
  if (!modelName) throw new Error(`Restore isn't supported for entity type "${revision.entityType}"`);

  const snapshot = revision.data as Record<string, unknown>;
  const cleaned = Object.fromEntries(Object.entries(snapshot).filter(([key]) => !STRIP_KEYS.has(key)));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const model = (prisma as any)[modelName];
  const restored = await model.update({ where: { id: revision.entityId }, data: cleaned });

  await createRevision({ entityType: revision.entityType, entityId: revision.entityId, data: restored, createdById: actorId });
  await logActivity({
    userId: actorId,
    action: "RESTORE",
    entityType: revision.entityType,
    entityId: revision.entityId,
    metadata: { restoredFromVersion: revision.versionNumber },
  });

  return restored;
}

/** Snapshots `data` as the next version for (entityType, entityId). Call this BEFORE persisting an update. */
export async function createRevision(params: {
  entityType: string;
  entityId: string;
  data: unknown;
  createdById?: string | null;
}): Promise<number> {
  const last = await prisma.revision.findFirst({
    where: { entityType: params.entityType, entityId: params.entityId },
    orderBy: { versionNumber: "desc" },
    select: { versionNumber: true },
  });
  const versionNumber = (last?.versionNumber ?? 0) + 1;

  await prisma.revision.create({
    data: {
      entityType: params.entityType,
      entityId: params.entityId,
      versionNumber,
      data: params.data as never,
      createdById: params.createdById ?? null,
    },
  });

  return versionNumber;
}

export function listRevisions(entityType: string, entityId: string) {
  return prisma.revision.findMany({
    where: { entityType, entityId },
    orderBy: { versionNumber: "desc" },
  });
}

/** One-level field diff between two revision snapshots — enough for a "what changed" view without a diff library. */
export function shallowDiff(
  before: Record<string, unknown>,
  after: Record<string, unknown>
): Array<{ field: string; before: unknown; after: unknown }> {
  const fields = new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]);
  const changes: Array<{ field: string; before: unknown; after: unknown }> = [];
  for (const field of fields) {
    const b = before?.[field];
    const a = after?.[field];
    if (JSON.stringify(b) !== JSON.stringify(a)) {
      changes.push({ field, before: b, after: a });
    }
  }
  return changes;
}
