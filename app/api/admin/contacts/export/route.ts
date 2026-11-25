import { requirePermission, apiErrorResponse } from "@/lib/api-guard";
import { listAllEnquiriesForExport } from "@/lib/services/contactService";
import { companyTypeLabel, lookingForLabel, enquiryTypeLabel, statusLabel } from "@/lib/contactEnquiryLabels";

function toCsvRow(values: (string | number | null | undefined)[]): string {
  return values.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",");
}

export async function GET(req: Request) {
  try {
    await requirePermission(req, "contacts.view");
    const rows = await listAllEnquiriesForExport();

    const header = toCsvRow([
      "Full Name",
      "Email",
      "Phone Number",
      "Company Type",
      "Looking For",
      "Company Name",
      "Designation",
      "Enquiry Type",
      "Course / Programme",
      "Status",
      "Created Date",
    ]);
    const body = rows.map((r) =>
      toCsvRow([
        r.name,
        r.email,
        r.phone,
        companyTypeLabel(r.companyType),
        lookingForLabel(r.lookingFor),
        r.companyName,
        r.designation,
        enquiryTypeLabel(r.enquiryType),
        r.courseInterested,
        statusLabel(r.status),
        r.createdAt.toISOString(),
      ])
    );
    const csv = [header, ...body].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="contact-enquiries.csv"`,
      },
    });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
