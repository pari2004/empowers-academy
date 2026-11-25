import { z } from "zod";
import { prisma } from "@/lib/db";
import { getStudentById } from "@/lib/services/studentService";
import { runCachedJsonFeature } from "@/lib/ai/run";
import { getValidatedInsight } from "@/lib/ai/cache";

const resultSchema = z.object({
  readinessScore: z.number().int().min(0).max(100),
  strengths: z.array(z.string()).default([]),
  gaps: z.array(z.string()).default([]),
});

export type PlacementReadinessResult = z.infer<typeof resultSchema>;

/** Reasoned over course/batch metadata (tools covered, batch completion) — no separate skills-assessment table exists yet. */
export async function placementReadiness(studentId: string, actorId?: string | null): Promise<PlacementReadinessResult> {
  const student = await getStudentById(studentId);
  if (!student) throw new Error("Student not found");

  const course = await prisma.course.findUnique({
    where: { id: student.courseId },
    select: { title: true, level: true, toolsCovered: true, learningOutcomes: true },
  });

  return runCachedJsonFeature({
    feature: "PLACEMENT_READINESS",
    scope: { entityType: "student", entityId: studentId },
    actorId,
    schema: resultSchema,
    build: () => ({
      system:
        "You assess how placement-ready a graduating student is for industry roles, reasoning only from the course " +
        "curriculum and batch progress given. Return a 0-100 readiness score, strengths, and concrete gaps to close.",
      messages: [
        {
          role: "user",
          content: [
            `Student: ${student.name}`,
            `Course: ${course?.title ?? student.course.title} (level: ${course?.level ?? "unspecified"})`,
            `Tools covered: ${course?.toolsCovered.join(", ") || "unspecified"}`,
            `Learning outcomes: ${course?.learningOutcomes.join(", ") || "unspecified"}`,
            `Batch: ${student.batch?.name ?? "Not assigned to a batch"}`,
            `Admission status: ${student.admissionStatus}`,
          ].join("\n"),
        },
      ],
    }),
  });
}

export function getCachedPlacementReadiness(studentId: string) {
  return getValidatedInsight("PLACEMENT_READINESS", { entityType: "student", entityId: studentId }, resultSchema);
}
