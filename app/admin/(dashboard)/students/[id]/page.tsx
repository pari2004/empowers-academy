import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { getStudentById } from "@/lib/services/studentService";
import StudentAdmissionPanel from "@/components/admin/students/StudentAdmissionPanel";
import AiStudentInsightsPanel from "@/components/admin/students/AiStudentInsightsPanel";

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = await getStudentById(id);
  if (!student) notFound();
  const session = await auth();
  const canUseAi = can(session, "ai.view");

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-foreground">{student.name}</h1>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-lg border border-border bg-card p-6">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">Email</dt>
              <dd className="text-sm text-foreground">{student.email ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Phone</dt>
              <dd className="text-sm text-foreground">{student.phone ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Course</dt>
              <dd className="text-sm text-foreground">{student.course.title}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Batch</dt>
              <dd className="text-sm text-foreground">{student.batch?.name ?? "Unassigned"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Enrolled</dt>
              <dd className="text-sm text-foreground">{new Date(student.enrolledAt).toLocaleString()}</dd>
            </div>
            {student.leadId && (
              <div>
                <dt className="text-xs text-muted-foreground">Source Lead</dt>
                <dd className="text-sm text-foreground">
                  <a href={`/admin/leads/${student.leadId}`} className="text-primary hover:underline">
                    View original lead
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>
        <div className="flex flex-col gap-4">
          <StudentAdmissionPanel
            studentId={student.id}
            courseId={student.courseId}
            admissionStatus={student.admissionStatus}
            batchId={student.batchId}
            offerLetterUrl={student.offerLetterUrl}
          />
          {canUseAi && <AiStudentInsightsPanel studentId={student.id} />}
        </div>
      </div>
    </div>
  );
}
