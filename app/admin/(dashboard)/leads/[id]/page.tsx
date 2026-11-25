import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { isTerminalStage } from "@/lib/leadPipeline";
import { getLeadById } from "@/lib/services/leadService";
import { getStudentByLeadId } from "@/lib/services/studentService";
import LeadForm from "@/components/admin/leads/LeadForm";
import LeadActivityPanel from "@/components/admin/leads/LeadActivityPanel";
import ConvertToStudentButton from "@/components/admin/leads/ConvertToStudentButton";
import AiInsightsPanel from "@/components/admin/leads/AiInsightsPanel";

function toDateInput(d: Date | null): string {
  return d ? d.toISOString().slice(0, 10) : "";
}

function toDateTimeInput(d: Date | null): string {
  return d ? d.toISOString().slice(0, 16) : "";
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await getLeadById(id);
  if (!lead) notFound();
  const existingStudent = await getStudentByLeadId(id);
  // "Convert to Student" is a manual pre-creation escape hatch, independent
  // of pipeline position — see studentService.convertLeadToStudent.
  const canConvert = !isTerminalStage(lead.stage);
  const session = await auth();
  const canUseAi = can(session, "ai.view");

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-foreground">{lead.name}</h1>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <LeadForm
          leadId={lead.id}
          initialValues={{
            name: lead.name,
            phone: lead.phone ?? "",
            whatsapp: lead.whatsapp ?? "",
            email: lead.email ?? "",
            city: lead.city ?? "",
            state: lead.state ?? "",
            college: lead.college ?? "",
            company: lead.company ?? "",
            experience: lead.experience ?? "",
            source: lead.source,
            interestedCourseId: lead.interestedCourseId,
            budget: lead.budget ? lead.budget.toString() : "",
            expectedJoining: toDateInput(lead.expectedJoining),
            leadScore: String(lead.leadScore),
            tags: lead.tags.join(", "),
            nextFollowUpAt: toDateTimeInput(lead.nextFollowUpAt),
          }}
        />
        <div className="flex flex-col gap-4">
          {existingStudent ? (
            <a
              href={`/admin/students/${existingStudent.id}`}
              className="flex items-center justify-center rounded-lg border border-border bg-card p-3 text-sm font-medium text-primary hover:underline"
            >
              View Student Record
            </a>
          ) : (
            canConvert && (
              <div className="rounded-lg border border-border bg-card p-4">
                <ConvertToStudentButton leadId={lead.id} />
              </div>
            )
          )}
          {canUseAi && <AiInsightsPanel leadId={lead.id} />}
          <LeadActivityPanel
            leadId={lead.id}
            leadName={lead.name}
            currentStage={lead.stage}
            courseId={lead.interestedCourseId}
          />
        </div>
      </div>
    </div>
  );
}
