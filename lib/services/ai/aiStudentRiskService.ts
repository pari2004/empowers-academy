import { z } from "zod";
import { getStudentById } from "@/lib/services/studentService";
import { runCachedJsonFeature } from "@/lib/ai/run";
import { getValidatedInsight } from "@/lib/ai/cache";

const resultSchema = z.object({
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH"]),
  score: z.number().int().min(0).max(100),
  reasons: z.array(z.string()).default([]),
});

export type StudentRiskResult = z.infer<typeof resultSchema>;

/**
 * There's no attendance/progress-tracking table in this schema yet, so risk
 * is reasoned over the signals that do exist (admission-status progression,
 * batch status/timing, time since enrollment) rather than a trained model.
 */
export async function predictRisk(studentId: string, actorId?: string | null): Promise<StudentRiskResult> {
  const student = await getStudentById(studentId);
  if (!student) throw new Error("Student not found");

  return runCachedJsonFeature({
    feature: "STUDENT_RISK",
    scope: { entityType: "student", entityId: studentId },
    actorId,
    schema: resultSchema,
    build: () => ({
      system:
        "You assess dropout/disengagement risk for a student at an ed-tech academy, reasoning only from the CRM " +
        "fields given (there is no attendance or grade data available). Return LOW/MEDIUM/HIGH risk with a 0-100 score " +
        "and concrete reasons.",
      messages: [
        {
          role: "user",
          content: [
            `Student: ${student.name}`,
            `Course: ${student.course.title}`,
            `Batch: ${student.batch?.name ?? "Not assigned to a batch"}`,
            `Admission status: ${student.admissionStatus}`,
            `Offer letter issued: ${student.offerLetterUrl ? "yes" : "no"}`,
            `Enrolled at: ${student.enrolledAt.toISOString().slice(0, 10)}`,
            `Days since enrollment: ${Math.floor((Date.now() - student.enrolledAt.getTime()) / 86_400_000)}`,
          ].join("\n"),
        },
      ],
    }),
  });
}

export function getCachedRisk(studentId: string) {
  return getValidatedInsight("STUDENT_RISK", { entityType: "student", entityId: studentId }, resultSchema);
}
