import { prisma } from "@/lib/db";
import { can } from "@/lib/rbac";
import { getDashboardStats, getLeadStats } from "@/lib/services/dashboardService";
import { runLoggedCompletion } from "@/lib/ai/run";
import type { AiMessage } from "@/lib/ai/types";

const HISTORY_LIMIT = 20;

export function listThreads(userId: string) {
  return prisma.aiChatThread.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } });
}

export async function getThread(threadId: string, userId: string) {
  const thread = await prisma.aiChatThread.findFirst({
    where: { id: threadId, userId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!thread) throw new Error("Chat thread not found");
  return thread;
}

/** Only includes CRM context the caller is actually permitted to see — the assistant can't leak data outside a user's RBAC scope. */
async function buildContextSummary(permissions: string[]): Promise<string> {
  const session = { user: { permissions } };
  const parts: string[] = [];

  if (can(session, "courses.view")) {
    const stats = await getDashboardStats();
    parts.push(`Content: ${stats.totalCourses} courses (${stats.publishedCourses} published), ${stats.totalBlogs} blog posts.`);
  }
  if (can(session, "leads.view")) {
    const leadStats = await getLeadStats();
    parts.push(
      `Leads: ${leadStats.newToday} new today, ${leadStats.active} active, ${leadStats.followUpsDue} follow-ups due, ${leadStats.conversionRate}% conversion.`
    );
  }

  return parts.length ? parts.join("\n") : "The current user has no CRM data visibility beyond chat.";
}

export async function sendMessage(params: {
  userId: string;
  permissions: string[];
  threadId?: string | null;
  message: string;
}) {
  const thread = params.threadId
    ? await prisma.aiChatThread.findFirst({ where: { id: params.threadId, userId: params.userId } })
    : await prisma.aiChatThread.create({ data: { userId: params.userId, title: params.message.slice(0, 60) } });

  if (!thread) throw new Error("Chat thread not found");

  await prisma.aiChatMessage.create({ data: { threadId: thread.id, role: "USER", content: params.message } });

  const history = await prisma.aiChatMessage.findMany({
    where: { threadId: thread.id },
    orderBy: { createdAt: "desc" },
    take: HISTORY_LIMIT,
  });

  const contextSummary = await buildContextSummary(params.permissions);
  const messages: AiMessage[] = history
    .reverse()
    .map((m) => ({ role: m.role === "USER" ? "user" : "assistant", content: m.content }));

  const { text } = await runLoggedCompletion({
    feature: "CHAT",
    ctx: { userId: params.userId, entityType: "chatThread", entityId: thread.id },
    build: () => ({
      system:
        "You are the AI assistant embedded in Empowers Academy's CRM/LMS admin panel. Answer questions about the " +
        "product's leads, students, courses, and operations helpfully and concisely. Only use the CRM snapshot given " +
        "below — never claim access to data you weren't given.\n\nCRM snapshot:\n" +
        contextSummary,
      messages,
    }),
  });

  const assistantMessage = await prisma.aiChatMessage.create({ data: { threadId: thread.id, role: "ASSISTANT", content: text } });
  await prisma.aiChatThread.update({ where: { id: thread.id }, data: { updatedAt: new Date() } });

  return { thread, message: assistantMessage };
}
