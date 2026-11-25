import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { extractTemplateVariables } from "@/lib/templateVariables";
import type { EmailTemplateInput, EmailTemplateUpdateInput } from "@/lib/validation/emailTemplate";
import type { Prisma } from "@prisma/client";

export type ListEmailTemplatesParams = {
  page?: number;
  pageSize?: number;
  category?: string;
  search?: string;
};

export async function listEmailTemplates(params: ListEmailTemplatesParams = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where: Prisma.EmailTemplateWhereInput = {
    ...(params.category ? { category: params.category as never } : {}),
    ...(params.search ? { name: { contains: params.search, mode: "insensitive" as const } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.emailTemplate.findMany({ where, orderBy: { name: "asc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.emailTemplate.count({ where }),
  ]);

  return { items, total, page, pageSize, pageCount: Math.ceil(total / pageSize) };
}

export function listActiveEmailTemplates() {
  return prisma.emailTemplate.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
}

export function getEmailTemplateById(id: string) {
  return prisma.emailTemplate.findUnique({ where: { id } });
}

export async function createEmailTemplate(input: EmailTemplateInput, actorId?: string | null) {
  const variables = input.variables.length
    ? input.variables
    : [...new Set([...extractTemplateVariables(input.subject), ...extractTemplateVariables(input.bodyHtml)])];

  const template = await prisma.emailTemplate.create({
    data: { ...input, variables, createdById: actorId ?? null, updatedById: actorId ?? null },
  });
  await logActivity({ userId: actorId, action: "CREATE", entityType: "emailTemplate", entityId: template.id });
  return template;
}

export async function updateEmailTemplate(id: string, input: EmailTemplateUpdateInput, actorId?: string | null) {
  const merged = { ...input };
  if ((input.subject || input.bodyHtml) && !input.variables) {
    const existing = await prisma.emailTemplate.findUnique({ where: { id } });
    const subject = input.subject ?? existing?.subject ?? "";
    const bodyHtml = input.bodyHtml ?? existing?.bodyHtml ?? "";
    merged.variables = [...new Set([...extractTemplateVariables(subject), ...extractTemplateVariables(bodyHtml)])];
  }

  const template = await prisma.emailTemplate.update({
    where: { id },
    data: { ...merged, updatedById: actorId ?? null },
  });
  await logActivity({ userId: actorId, action: "UPDATE", entityType: "emailTemplate", entityId: id });
  return template;
}

export async function deleteEmailTemplate(id: string, actorId?: string | null) {
  await prisma.emailTemplate.delete({ where: { id } });
  await logActivity({ userId: actorId, action: "DELETE", entityType: "emailTemplate", entityId: id });
}
