export type AdmissionStatus = "APPLICATION_RECEIVED" | "DOCUMENTS_VERIFIED" | "OFFER_SENT" | "FEE_PENDING" | "CONFIRMED";

export type Student = {
  id: string;
  leadId: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  courseId: string;
  course: { id: string; title: string };
  batchId: string | null;
  batch: { id: string; name: string } | null;
  admissionStatus: AdmissionStatus;
  offerLetterUrl: string | null;
  enrolledAt: string;
  assignedToId: string | null;
  createdAt: string;
  updatedAt: string;
};

export const ADMISSION_STATUSES: Array<{ value: AdmissionStatus; label: string }> = [
  { value: "APPLICATION_RECEIVED", label: "Application Received" },
  { value: "DOCUMENTS_VERIFIED", label: "Documents Verified" },
  { value: "OFFER_SENT", label: "Offer Sent" },
  { value: "FEE_PENDING", label: "Fee Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
];

export function admissionStatusLabel(status: AdmissionStatus): string {
  return ADMISSION_STATUSES.find((s) => s.value === status)?.label ?? status;
}
