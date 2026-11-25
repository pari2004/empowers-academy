import { prisma } from "@/lib/db";
import { TERMINAL_OUTCOMES } from "@/lib/leadPipeline";

const CLOSED_STAGES = [...TERMINAL_OUTCOMES.map((s) => s.value), "ONBOARDED_LEARNER"] as const;

export async function getDashboardStats() {
  const [
    totalCourses,
    publishedCourses,
    draftCourses,
    totalInstructors,
    totalBlogs,
    totalTestimonials,
    totalFaqs,
    totalMedia,
    totalEnquiries,
    totalSubscribers,
  ] = await Promise.all([
    prisma.course.count({ where: { deletedAt: null } }),
    prisma.course.count({ where: { deletedAt: null, status: "PUBLISHED" } }),
    prisma.course.count({ where: { deletedAt: null, status: "DRAFT" } }),
    prisma.instructor.count({ where: { deletedAt: null } }),
    prisma.blog.count({ where: { deletedAt: null } }),
    prisma.testimonial.count({ where: { deletedAt: null } }),
    prisma.faq.count({ where: { deletedAt: null } }),
    prisma.mediaFile.count({ where: { deletedAt: null } }),
    prisma.contactEnquiry.count(),
    prisma.newsletterSubscriber.count(),
  ]);

  return {
    totalCourses,
    publishedCourses,
    draftCourses,
    totalInstructors,
    totalBlogs,
    totalTestimonials,
    totalFaqs,
    totalMedia,
    totalEnquiries,
    totalSubscribers,
  };
}

export function getRecentActivity(limit = 15) {
  return prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: limit });
}

/** Daily counts for the last `days` days, oldest first — used by the dashboard's line charts. */
async function dailyCounts(
  rows: { createdAt: Date }[],
  days: number
): Promise<Array<{ date: string; count: number }>> {
  const buckets = new Map<string, number>();
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }
  for (const row of rows) {
    const key = row.createdAt.toISOString().slice(0, 10);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return Array.from(buckets.entries()).map(([date, count]) => ({ date, count }));
}

export async function getCourseViewsSeries(days = 14) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const rows = await prisma.courseView.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true },
  });
  return dailyCounts(rows, days);
}

export async function getEnquiriesSeries(days = 14) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const rows = await prisma.contactEnquiry.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true },
  });
  return dailyCounts(rows, days);
}

export async function getPopularCourses(limit = 5) {
  const grouped = await prisma.courseView.groupBy({
    by: ["courseId"],
    _count: { courseId: true },
    orderBy: { _count: { courseId: "desc" } },
    take: limit,
  });
  const courses = await prisma.course.findMany({
    where: { id: { in: grouped.map((g) => g.courseId) } },
    select: { id: true, title: true },
  });
  const titleById = new Map(courses.map((c) => [c.id, c.title]));
  return grouped.map((g) => ({
    courseId: g.courseId,
    title: titleById.get(g.courseId) ?? "Unknown",
    views: g._count.courseId,
  }));
}

export async function getVisitorAnalyticsSeries(days = 14) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const rows = await prisma.pageView.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true },
  });
  return dailyCounts(rows, days);
}

export async function getLeadStats() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [newToday, active, followUpsDue, total, onboarded] = await Promise.all([
    prisma.lead.count({ where: { deletedAt: null, createdAt: { gte: startOfToday } } }),
    prisma.lead.count({ where: { deletedAt: null, stage: { notIn: [...CLOSED_STAGES] } } }),
    prisma.lead.count({ where: { deletedAt: null, nextFollowUpAt: { lte: new Date() } } }),
    prisma.lead.count({ where: { deletedAt: null } }),
    prisma.lead.count({ where: { deletedAt: null, stage: "ONBOARDED_LEARNER" } }),
  ]);

  return {
    newToday,
    active,
    followUpsDue,
    conversionRate: total === 0 ? 0 : Math.round((onboarded / total) * 1000) / 10,
  };
}

export async function getLeadPipelineCounts() {
  const grouped = await prisma.lead.groupBy({
    by: ["stage"],
    where: { deletedAt: null },
    _count: { stage: true },
  });
  return grouped.map((g) => ({ stage: g.stage, count: g._count.stage }));
}

export async function getLeadsSeries(days = 14) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const rows = await prisma.lead.findMany({
    where: { deletedAt: null, createdAt: { gte: since } },
    select: { createdAt: true },
  });
  return dailyCounts(rows, days);
}

export async function getLeadsBySource() {
  const grouped = await prisma.lead.groupBy({
    by: ["source"],
    where: { deletedAt: null },
    _count: { source: true },
  });
  return grouped.map((g) => ({ source: g.source, count: g._count.source }));
}

export async function getUpcomingSessions(limit = 5) {
  const leads = await prisma.lead.findMany({
    where: { deletedAt: null, sessionScheduledAt: { gte: new Date() } },
    orderBy: { sessionScheduledAt: "asc" },
    take: limit,
    select: {
      id: true,
      name: true,
      sessionScheduledAt: true,
      assignedToId: true,
      course: { select: { title: true } },
    },
  });

  const assigneeIds = [...new Set(leads.map((l) => l.assignedToId).filter((id): id is string => !!id))];
  const users = assigneeIds.length
    ? await prisma.user.findMany({ where: { id: { in: assigneeIds } }, select: { id: true, name: true } })
    : [];
  const nameById = new Map(users.map((u) => [u.id, u.name]));

  return leads.map((l) => ({
    id: l.id,
    name: l.name,
    sessionScheduledAt: l.sessionScheduledAt!,
    courseTitle: l.course?.title ?? null,
    assigneeName: l.assignedToId ? (nameById.get(l.assignedToId) ?? "Unassigned") : "Unassigned",
  }));
}

/** Leads whose next follow-up falls due today (overdue-inclusive, same semantics as getLeadStats().followUpsDue). */
export async function getTodaysFollowUps(limit = 5) {
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const leads = await prisma.lead.findMany({
    where: { deletedAt: null, nextFollowUpAt: { lte: endOfToday } },
    orderBy: { nextFollowUpAt: "asc" },
    take: limit,
    select: { id: true, name: true, nextFollowUpAt: true, assignedToId: true, stage: true },
  });

  const assigneeIds = [...new Set(leads.map((l) => l.assignedToId).filter((id): id is string => !!id))];
  const users = assigneeIds.length
    ? await prisma.user.findMany({ where: { id: { in: assigneeIds } }, select: { id: true, name: true } })
    : [];
  const nameById = new Map(users.map((u) => [u.id, u.name]));

  return leads.map((l) => ({
    id: l.id,
    name: l.name,
    nextFollowUpAt: l.nextFollowUpAt!,
    stage: l.stage,
    assigneeName: l.assignedToId ? (nameById.get(l.assignedToId) ?? "Unassigned") : "Unassigned",
  }));
}

/** `assignedToId` is a plain audit/reference string (see schema header comment), so counsellor
 *  names are resolved with a second User lookup rather than a Prisma relation/join. */
export async function getCounsellorPerformance() {
  const [totals, onboarded] = await Promise.all([
    prisma.lead.groupBy({ by: ["assignedToId"], where: { deletedAt: null, assignedToId: { not: null } }, _count: { assignedToId: true } }),
    prisma.lead.groupBy({
      by: ["assignedToId"],
      where: { deletedAt: null, assignedToId: { not: null }, stage: "ONBOARDED_LEARNER" },
      _count: { assignedToId: true },
    }),
  ]);

  const onboardedById = new Map(onboarded.map((e) => [e.assignedToId, e._count.assignedToId]));
  const ids = totals.map((t) => t.assignedToId).filter((id): id is string => !!id);
  const users = ids.length ? await prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } }) : [];
  const nameById = new Map(users.map((u) => [u.id, u.name]));

  return totals
    .map((t) => {
      const assigned = t._count.assignedToId;
      const won = onboardedById.get(t.assignedToId) ?? 0;
      return {
        userId: t.assignedToId!,
        name: nameById.get(t.assignedToId!) ?? "Unknown",
        assigned,
        onboarded: won,
        conversionRate: assigned === 0 ? 0 : Math.round((won / assigned) * 1000) / 10,
      };
    })
    .sort((a, b) => b.assigned - a.assigned);
}

export async function getAdmissionStats() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const admissionsToday = await prisma.student.count({
    where: { deletedAt: null, createdAt: { gte: startOfToday } },
  });

  return { admissionsToday };
}

export async function getBatchFillRates(limit = 6) {
  const batches = await prisma.batch.findMany({
    where: { deletedAt: null, status: { in: ["UPCOMING", "ONGOING"] } },
    orderBy: { startDate: "asc" },
    take: limit,
    select: { id: true, name: true, capacity: true, _count: { select: { students: true } } },
  });

  return batches.map((b) => ({
    name: b.name,
    enrolled: b._count.students,
    capacity: b.capacity,
    fillRate: b.capacity === 0 ? 0 : Math.round((b._count.students / b.capacity) * 100),
  }));
}
