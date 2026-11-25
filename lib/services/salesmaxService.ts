import { companyTypeLabel, lookingForLabel, enquiryTypeLabel } from "@/lib/contactEnquiryLabels";

// Server-side SalesMax lead sync.
//
// The previous integration was the browser-loaded formdata/js/v1/index.js
// snippet — it throws `ReferenceError: jQuery is not defined` on every page
// (this site has no jQuery) and took production down. That loader is gone
// for good; it must never be re-added to app/layout.tsx or any other page.
//
// SalesMax's production integration endpoint auths via a `token` query
// param on the URL itself (not an Authorization header) — this is the
// account's production endpoint from SalesMax's own onboarding, e.g.
// https://integration.pqa.salesmax.ai/salesmax/leads?token=xxxx.
// The account is identified by endpoint + token alone — no accountId field
// is sent (SalesMax onboarding never issued one for this account).
// SALES_MAX_ENDPOINT/TOKEN are plain server-only env vars (never
// NEXT_PUBLIC_) — until they're set, this is a no-op. The field *names* we
// send — fullName, phoneNumber, etc. — come directly from the mapping
// SalesMax support gave us; the JSON envelope around them is a reasonable
// default, not a confirmed contract.
export type SalesMaxLead = {
  fullName: string;
  phoneNumber: string;
  emailAddress: string;
  companyName: string | null;
  designation: string | null;
  companyType: string | null;
  lookingFor: string | null;
  enquiryType: string | null;
};

const SALES_MAX_ENDPOINT = process.env.SALES_MAX_ENDPOINT;
const SALES_MAX_TOKEN = process.env.SALES_MAX_TOKEN;

/**
 * Forwards a lead to SalesMax after it's already been saved to the Empowers
 * Academy CRM. Never throws — a SalesMax outage or missing config must not
 * affect the user's form submission. Callers can `await` this for
 * deterministic ordering; failures are logged server-side only.
 */
export async function sendLeadToSalesMax(lead: SalesMaxLead): Promise<void> {
  if (!SALES_MAX_ENDPOINT || !SALES_MAX_TOKEN) {
    // Not configured yet — expected until real onboarding credentials exist.
    return;
  }

  try {
    const url = new URL(SALES_MAX_ENDPOINT);
    url.searchParams.set("token", SALES_MAX_TOKEN);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        website: "empowersacademy.com",
        fullName: lead.fullName,
        phoneNumber: lead.phoneNumber,
        emailAddress: lead.emailAddress,
        companyName: lead.companyName,
        designation: lead.designation,
        companyType: companyTypeLabel(lead.companyType),
        lookingFor: lookingForLabel(lead.lookingFor),
        leadSource: enquiryTypeLabel(lead.enquiryType),
      }),
    });

    if (!res.ok) {
      console.error("SalesMax lead sync failed", res.status, await res.text().catch(() => ""));
    }
  } catch (err) {
    console.error("SalesMax lead sync failed", err);
  }
}
