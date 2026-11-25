import { z } from "zod";
import { requiredIndianPhone } from "@/lib/validation/phone";

export const companyTypeValues = ["SERVICE_BASED", "PRODUCT_BASED"] as const;
export const lookingForValues = ["SWITCH_CAREER", "GROW_ROLE", "HIGHER_OFFER", "NOT_SURE"] as const;
export const enquiryTypeValues = ["CALLBACK", "BROCHURE_DOWNLOAD", "QUIZ_RESULT", "MASTERCLASS_SIGNUP"] as const;
export const enquiryStatusValues = ["NEW", "CONTACTED", "QUALIFIED", "FOLLOW_UP", "ENROLLED", "CLOSED"] as const;

// companyType/lookingFor/companyName are only mandatory for the full
// "Request a Callback" / "Download Brochure" form (RequestCallbackModal,
// which always sends all three) — the lighter QUIZ_RESULT/MASTERCLASS_SIGNUP
// sources don't collect them, and the DB columns are nullable either way.
const lightweightEnquiryTypes = ["QUIZ_RESULT", "MASTERCLASS_SIGNUP"] as const;

export const contactEnquirySchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    phone: requiredIndianPhone,
    email: z.string().email("Valid email is required"),
    message: z.string().optional(),
    courseInterested: z.string().optional(),
    companyType: z.enum(companyTypeValues).optional(),
    lookingFor: z.enum(lookingForValues).optional(),
    companyName: z.string().optional(),
    designation: z.string().optional(),
    enquiryType: z.enum(enquiryTypeValues),
  })
  .refine(
    (data) =>
      (lightweightEnquiryTypes as readonly string[]).includes(data.enquiryType) ||
      !!(data.companyType && data.lookingFor && data.companyName),
    { message: "Company details are required for this enquiry type", path: ["companyName"] }
  );

export const contactEnquiryUpdateSchema = z.object({
  status: z.enum(enquiryStatusValues).optional(),
  assignedToId: z.string().uuid().optional().nullable(),
  notes: z.string().optional().nullable(),
});
