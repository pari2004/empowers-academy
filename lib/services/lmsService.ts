import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";

/**
 * No real LMS system exists yet in this codebase — this is an internal stub
 * for the pipeline's "link learner to LMS" onboarding step. It marks the
 * Student as linked (Student.lmsUserId/lmsLinkedAt) so the pipeline and UI
 * can treat onboarding as complete today. Swap the body for a real LMS API
 * call once one exists; the linkStudentToLms(studentId) signature — and its
 * callers in leadService.transitionStage — should not need to change.
 */
export async function linkStudentToLms(studentId: string, actorId?: string | null) {
  const student = await prisma.student.update({
    where: { id: studentId },
    data: { lmsUserId: `lms_${studentId}`, lmsLinkedAt: new Date() },
  });
  await logActivity({ userId: actorId, action: "UPDATE", entityType: "student", entityId: studentId, metadata: { lmsLinked: true } });
  return student;
}
