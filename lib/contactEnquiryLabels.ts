// Shared display-label lookups for ContactEnquiry enum fields — used by both
// the admin Contact Enquiries page and the CSV export so labels stay in sync.

export type ContactCompanyType = "SERVICE_BASED" | "PRODUCT_BASED";
export type ContactLookingFor = "SWITCH_CAREER" | "GROW_ROLE" | "HIGHER_OFFER" | "NOT_SURE";
export type ContactEnquiryType = "CALLBACK" | "BROCHURE_DOWNLOAD";
export type EnquiryStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "FOLLOW_UP" | "ENROLLED" | "CLOSED";

const EMPTY = "—";

const companyTypeLabels: Record<ContactCompanyType, string> = {
  SERVICE_BASED: "Service-Based Company",
  PRODUCT_BASED: "Product-Based Company",
};

const lookingForLabels: Record<ContactLookingFor, string> = {
  SWITCH_CAREER: "Switch into an AI career",
  GROW_ROLE: "Grow in my current role",
  HIGHER_OFFER: "Land a higher-paying offer",
  NOT_SURE: "Not sure yet",
};

const enquiryTypeLabels: Record<ContactEnquiryType, string> = {
  CALLBACK: "Callback Request",
  BROCHURE_DOWNLOAD: "Brochure Download",
};

// Display label only — the underlying ENROLLED value is unchanged in the DB
// to avoid a data migration; "Converted" is just how it reads in the CRM.
const statusLabels: Record<EnquiryStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  FOLLOW_UP: "Follow-up",
  ENROLLED: "Converted",
  CLOSED: "Closed",
};

export function companyTypeLabel(value: string | null | undefined): string {
  return (value && companyTypeLabels[value as ContactCompanyType]) || EMPTY;
}

export function lookingForLabel(value: string | null | undefined): string {
  return (value && lookingForLabels[value as ContactLookingFor]) || EMPTY;
}

export function enquiryTypeLabel(value: string | null | undefined): string {
  return (value && enquiryTypeLabels[value as ContactEnquiryType]) || EMPTY;
}

export function statusLabel(value: string | null | undefined): string {
  return (value && statusLabels[value as EnquiryStatus]) || EMPTY;
}

export const companyTypeOptions = Object.entries(companyTypeLabels).map(([value, label]) => ({ value, label }));
export const lookingForOptions = Object.entries(lookingForLabels).map(([value, label]) => ({ value, label }));
export const enquiryTypeOptions = Object.entries(enquiryTypeLabels).map(([value, label]) => ({ value, label }));
export const statusOptions = Object.entries(statusLabels).map(([value, label]) => ({ value, label }));
