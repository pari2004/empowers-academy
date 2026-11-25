import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import type { SettingsInput } from "@/lib/validation/settings";

export async function getSiteSettings() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  return settings ?? prisma.siteSettings.create({ data: { id: "singleton" } });
}

export async function updateSiteSettings(input: SettingsInput, actorId?: string | null) {
  const settings = await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: { ...input, updatedById: actorId ?? null } as never,
    create: { id: "singleton", ...input, updatedById: actorId ?? null } as never,
  });
  await logActivity({ userId: actorId, action: "UPDATE", entityType: "siteSettings", entityId: "singleton" });
  return settings;
}
