import { prisma } from "@/lib/db";

// Public-safe batch read: never `include: { students }` (full PII — name,
// contact, payment ties). Only the count crosses the public boundary.
export async function getUpcomingBatchForCourse(courseId: string) {
  const batch = await prisma.batch.findFirst({
    where: { courseId, deletedAt: null, status: "UPCOMING", startDate: { gte: new Date() } },
    orderBy: { startDate: "asc" },
    select: {
      startDate: true,
      endDate: true,
      capacity: true,
      timing: true,
      _count: { select: { students: true } },
    },
  });
  if (!batch) return null;

  const seatsLeft = batch.capacity > 0 ? Math.max(0, batch.capacity - batch._count.students) : null;

  return {
    startDate: batch.startDate,
    endDate: batch.endDate,
    timing: batch.timing,
    capacity: batch.capacity > 0 ? batch.capacity : null,
    seatsLeft,
  };
}
