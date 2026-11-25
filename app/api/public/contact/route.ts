import { NextResponse } from "next/server";
import { assertSameOrigin, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { createEnquiry } from "@/lib/services/contactService";
import { sendLeadToSalesMax } from "@/lib/services/salesmaxService";
import { contactEnquirySchema } from "@/lib/validation/contact";

// Public endpoint (no auth) — the site's RequestCallbackModal posts here in
// addition to Formspree, so enquiries land in the CMS for counselor follow-up.
export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const parsed = contactEnquirySchema.safeParse(await req.json());
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    // CRM is the source of truth: save first, respond success as soon as
    // that's done. SalesMax sync runs after, and its failure (or simply not
    // being configured yet) must never turn a saved lead into a user-facing error.
    const enquiry = await createEnquiry(parsed.data);
    await sendLeadToSalesMax({
      fullName: parsed.data.name,
      phoneNumber: parsed.data.phone,
      emailAddress: parsed.data.email,
      companyName: parsed.data.companyName ?? null,
      designation: parsed.data.designation ?? null,
      companyType: parsed.data.companyType ?? null,
      lookingFor: parsed.data.lookingFor ?? null,
      enquiryType: parsed.data.enquiryType ?? null,
    });

    return NextResponse.json({ ok: true, id: enquiry.id }, { status: 201 });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
