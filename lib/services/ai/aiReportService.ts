import { z } from "zod";
import { prisma } from "@/lib/db";
import { runCachedJsonFeature } from "@/lib/ai/run";
import type { AiReportRequest } from "@/lib/validation/ai";

const resultSchema = z.object({
  title: z.string(),
  summary: z.string(),
  sections: z.array(z.object({ heading: z.string(), body: z.string() })).default([]),
});

export type ReportResult = z.infer<typeof resultSchema>;

async function buildReportContext(req: AiReportRequest) {
  const range = { gte: req.from, lte: req.to };

  switch (req.scope) {
    case "leads": {
      const [total, byStage, bySource] = await Promise.all([
        prisma.lead.count({ where: { deletedAt: null, createdAt: range } }),
        prisma.lead.groupBy({ by: ["stage"], where: { deletedAt: null, createdAt: range }, _count: { stage: true } }),
        prisma.lead.groupBy({ by: ["source"], where: { deletedAt: null, createdAt: range }, _count: { source: true } }),
      ]);
      return { total, byStage, bySource };
    }
    case "students": {
      const [total, byStatus] = await Promise.all([
        prisma.student.count({ where: { deletedAt: null, enrolledAt: range } }),
        prisma.student.groupBy({ by: ["admissionStatus"], where: { deletedAt: null, enrolledAt: range }, _count: { admissionStatus: true } }),
      ]);
      return { total, byStatus };
    }
    case "courses": {
      const courses = await prisma.course.findMany({
        where: { deletedAt: null, createdAt: range },
        select: { title: true, status: true, level: true },
      });
      return { total: courses.length, courses };
    }
    case "revenue": {
      const students = await prisma.student.findMany({
        where: { deletedAt: null, enrolledAt: range },
        select: { course: { select: { price: true, discountPrice: true } } },
      });
      const total = students.reduce((sum, s) => sum + Number(s.course.discountPrice ?? s.course.price ?? 0), 0);
      return { enrollments: students.length, totalRevenue: total };
    }
  }
}

export async function generateReport(req: AiReportRequest, actorId?: string | null): Promise<ReportResult> {
  const context = await buildReportContext(req);
  const from = req.from.toISOString().slice(0, 10);
  const to = req.to.toISOString().slice(0, 10);

  return runCachedJsonFeature({
    feature: "REPORT",
    scope: { entityType: "report", entityId: `${req.scope}:${from}:${to}` },
    actorId,
    schema: resultSchema,
    build: () => ({
      system:
        "You write concise executive reports for a CRM/LMS admin team from raw aggregate data. Produce a title, a " +
        "short summary paragraph, and a few labeled sections covering the notable patterns in the data. Reference " +
        "actual numbers from the data — never invent figures.",
      messages: [
        {
          role: "user",
          content: `Report scope: ${req.scope}\nDate range: ${from} to ${to}\n\nData:\n${JSON.stringify(context, null, 2)}`,
        },
      ],
    }),
  });
}
