import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import type { z } from "zod";
import type { contactEnquirySchema, contactEnquiryUpdateSchema } from "@/lib/validation/contact";

export type ContactEnquiryInput = z.infer<typeof contactEnquirySchema>;
export type ContactEnquiryUpdateInput = z.infer<typeof contactEnquiryUpdateSchema>;

export type ListEnquiriesParams = {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
  enquiryType?: string;
  companyType?: string;
  lookingFor?: string;
};

function buildWhere(params: ListEnquiriesParams) {
  return {
    ...(params.status ? { status: params.status as never } : {}),
    ...(params.enquiryType ? { enquiryType: params.enquiryType as never } : {}),
    ...(params.companyType ? { companyType: params.companyType as never } : {}),
    ...(params.lookingFor ? { lookingFor: params.lookingFor as never } : {}),
    ...(params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: "insensitive" as const } },
            { email: { contains: params.search, mode: "insensitive" as const } },
            { phone: { contains: params.search, mode: "insensitive" as const } },
            { companyName: { contains: params.search, mode: "insensitive" as const } },
            { designation: { contains: params.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
}

export async function listEnquiries(params: ListEnquiriesParams = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where = buildWhere(params);

  const [items, total] = await Promise.all([
    prisma.contactEnquiry.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.contactEnquiry.count({ where }),
  ]);

  return { items, total, page, pageSize, pageCount: Math.ceil(total / pageSize) };
}

export function listAllEnquiriesForExport() {
  return prisma.contactEnquiry.findMany({ orderBy: { createdAt: "desc" } });
}

// No formal duplicate-lead pipeline exists for ContactEnquiry (unlike the
// separate Lead CRM's DUPLICATE_LEAD stage). Per product requirements: never
// silently drop or overwrite a resubmission — always keep the new enquiry,
// just flag it in `notes` so counselors can see it's a repeat contact.
async function findExistingMatch(email: string, phone?: string) {
  return prisma.contactEnquiry.findFirst({
    where: { OR: [{ email }, ...(phone ? [{ phone }] : [])] },
    orderBy: { createdAt: "desc" },
  });
}

export async function createEnquiry(input: ContactEnquiryInput) {
  const existing = await findExistingMatch(input.email, input.phone);
  const data = existing
    ? {
        ...input,
        notes: [
          `Possible duplicate — matches enquiry from ${existing.createdAt.toISOString().slice(0, 10)} (id: ${existing.id}).`,
          input.message,
        ]
          .filter(Boolean)
          .join("\n"),
      }
    : input;

  const enquiry = await prisma.contactEnquiry.create({ data });
  await logActivity({ action: "CREATE", entityType: "contactEnquiry", entityId: enquiry.id });
  return enquiry;
}

export async function updateEnquiry(id: string, input: ContactEnquiryUpdateInput, actorId?: string | null) {
  const enquiry = await prisma.contactEnquiry.update({ where: { id }, data: input });
  await logActivity({ userId: actorId, action: "UPDATE", entityType: "contactEnquiry", entityId: id });
  return enquiry;
}

export async function deleteEnquiry(id: string, actorId?: string | null) {
  await prisma.contactEnquiry.delete({ where: { id } });
  await logActivity({ userId: actorId, action: "DELETE", entityType: "contactEnquiry", entityId: id });
}
