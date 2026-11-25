import { requirePermission, apiErrorResponse } from "@/lib/api-guard";
import { listAllLeadsForExport } from "@/lib/services/leadService";

function toCsvRow(values: (string | number | null | undefined)[]): string {
  return values.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",");
}

export async function GET(req: Request) {
  try {
    await requirePermission(req, "leads.view");
    const rows = await listAllLeadsForExport();

    const header = toCsvRow([
      "Name", "Phone", "WhatsApp", "Email", "City", "State", "College", "Company", "Experience",
      "Source", "Interested Course", "Budget", "Expected Joining", "Lead Score", "Tags", "Stage",
      "Next Follow-up", "Created At",
    ]);
    const body = rows.map((r) =>
      toCsvRow([
        r.name, r.phone, r.whatsapp, r.email, r.city, r.state, r.college, r.company, r.experience,
        r.source, r.course?.title, r.budget?.toString(), r.expectedJoining?.toISOString(), r.leadScore,
        r.tags.join("; "), r.stage, r.nextFollowUpAt?.toISOString(), r.createdAt.toISOString(),
      ])
    );
    const csv = [header, ...body].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="leads.csv"`,
      },
    });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
