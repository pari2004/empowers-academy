import { prisma } from "@/lib/db";
import { toCsv, csvResponse } from "@/lib/csv";
import { renderPdf } from "@/lib/pdf/renderPdf";

export type ReportType =
  | "communication"
  | "email-performance"
  | "notification-stats"
  | "task-completion"
  | "workflow-activity"
  | "reminder-effectiveness";

export type DateRange = { from?: Date; to?: Date };

function dateRangeWhere(field: string, range: DateRange) {
  if (!range.from && !range.to) return {};
  return { [field]: { ...(range.from ? { gte: range.from } : {}), ...(range.to ? { lte: range.to } : {}) } };
}

export async function getCommunicationReport(range: DateRange = {}) {
  const where = dateRangeWhere("createdAt", range);
  const [byChannel, byStatus, total] = await Promise.all([
    prisma.communicationLog.groupBy({ by: ["channel"], _count: { _all: true }, where }),
    prisma.communicationLog.groupBy({ by: ["status"], _count: { _all: true }, where }),
    prisma.communicationLog.count({ where }),
  ]);
  return { total, byChannel: byChannel.map((r) => ({ channel: r.channel, count: r._count._all })), byStatus: byStatus.map((r) => ({ status: r.status, count: r._count._all })) };
}

export async function getEmailPerformanceReport(range: DateRange = {}) {
  const where = dateRangeWhere("createdAt", range);
  const [byStatus, total, opened, sent, failed, bounced] = await Promise.all([
    prisma.emailLog.groupBy({ by: ["status"], _count: { _all: true }, where }),
    prisma.emailLog.count({ where }),
    prisma.emailLog.count({ where: { ...where, openedAt: { not: null } } }),
    prisma.emailLog.count({ where: { ...where, status: { in: ["SENT", "DELIVERED", "OPENED"] } } }),
    prisma.emailLog.count({ where: { ...where, status: "FAILED" } }),
    prisma.emailLog.count({ where: { ...where, status: "BOUNCED" } }),
  ]);
  return {
    total,
    sent,
    opened,
    failed,
    bounced,
    openRate: sent > 0 ? opened / sent : 0,
    byStatus: byStatus.map((r) => ({ status: r.status, count: r._count._all })),
  };
}

export async function getNotificationStatsReport(range: DateRange = {}) {
  const where = dateRangeWhere("createdAt", range);
  const [byType, byPriority, total, unread] = await Promise.all([
    prisma.notification.groupBy({ by: ["type"], _count: { _all: true }, where }),
    prisma.notification.groupBy({ by: ["priority"], _count: { _all: true }, where }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { ...where, isRead: false } }),
  ]);
  return {
    total,
    unread,
    byType: byType.map((r) => ({ type: r.type, count: r._count._all })),
    byPriority: byPriority.map((r) => ({ priority: r.priority, count: r._count._all })),
  };
}

export async function getTaskCompletionReport(range: DateRange = {}) {
  const where = { deletedAt: null, ...dateRangeWhere("createdAt", range) };
  const [byStatus, total, completed, overdue] = await Promise.all([
    prisma.task.groupBy({ by: ["status"], _count: { _all: true }, where }),
    prisma.task.count({ where }),
    prisma.task.count({ where: { ...where, status: "COMPLETED" } }),
    prisma.task.count({ where: { deletedAt: null, status: { in: ["PENDING", "IN_PROGRESS"] }, dueDate: { lt: new Date() } } }),
  ]);
  return {
    total,
    completed,
    overdue,
    completionRate: total > 0 ? completed / total : 0,
    byStatus: byStatus.map((r) => ({ status: r.status, count: r._count._all })),
  };
}

export async function getWorkflowActivityReport(range: DateRange = {}) {
  const where = dateRangeWhere("triggeredAt", range);
  const [byStatus, total, topWorkflows] = await Promise.all([
    prisma.workflowRun.groupBy({ by: ["status"], _count: { _all: true }, where }),
    prisma.workflowRun.count({ where }),
    prisma.workflowRun.groupBy({ by: ["workflowId"], _count: { _all: true }, where, orderBy: { _count: { workflowId: "desc" } }, take: 10 }),
  ]);

  const workflowNames = await prisma.workflow.findMany({
    where: { id: { in: topWorkflows.map((w) => w.workflowId) } },
    select: { id: true, name: true },
  });
  const nameById = new Map(workflowNames.map((w) => [w.id, w.name]));

  return {
    total,
    byStatus: byStatus.map((r) => ({ status: r.status, count: r._count._all })),
    topWorkflows: topWorkflows.map((w) => ({ workflowId: w.workflowId, name: nameById.get(w.workflowId) ?? "—", count: w._count._all })),
  };
}

export async function getReminderEffectivenessReport(range: DateRange = {}) {
  const where = dateRangeWhere("createdAt", range);
  const [byStatus, total, sent] = await Promise.all([
    prisma.reminder.groupBy({ by: ["status"], _count: { _all: true }, where }),
    prisma.reminder.count({ where }),
    prisma.reminder.count({ where: { ...where, status: "SENT" } }),
  ]);
  return {
    total,
    sent,
    effectivenessRate: total > 0 ? sent / total : 0,
    byStatus: byStatus.map((r) => ({ status: r.status, count: r._count._all })),
  };
}

const REPORT_LOADERS: Record<ReportType, (range: DateRange) => Promise<Record<string, unknown>>> = {
  communication: getCommunicationReport,
  "email-performance": getEmailPerformanceReport,
  "notification-stats": getNotificationStatsReport,
  "task-completion": getTaskCompletionReport,
  "workflow-activity": getWorkflowActivityReport,
  "reminder-effectiveness": getReminderEffectivenessReport,
};

const REPORT_TITLES: Record<ReportType, string> = {
  communication: "Communication Report",
  "email-performance": "Email Performance Report",
  "notification-stats": "Notification Statistics",
  "task-completion": "Task Completion Report",
  "workflow-activity": "Workflow Activity Report",
  "reminder-effectiveness": "Reminder Effectiveness Report",
};

export async function getReport(type: ReportType, range: DateRange = {}) {
  return REPORT_LOADERS[type](range);
}

/** Flattens a report's grouped-by-X breakdown array (the shape every report above returns for at least one field) into CSV rows. */
function breakdownRows(data: Record<string, unknown>): string[][] {
  const rows: string[][] = [];
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      for (const row of value) {
        if (row && typeof row === "object") {
          rows.push([key, ...Object.values(row as Record<string, unknown>).map((v) => String(v))]);
        }
      }
    } else {
      rows.push(["summary", key, String(value)]);
    }
  }
  return rows;
}

export async function exportReportCsv(type: ReportType, range: DateRange = {}): Promise<Response> {
  const data = await getReport(type, range);
  const csv = toCsv(["Section", "Field", "Value"], breakdownRows(data));
  return csvResponse(csv, `${type}-report.csv`);
}

export async function exportReportPdf(type: ReportType, range: DateRange = {}): Promise<Buffer> {
  const data = await getReport(type, range);
  const rows = breakdownRows(data);

  return renderPdf((doc) => {
    doc.fontSize(18).text(REPORT_TITLES[type]);
    doc.moveDown();
    doc.fontSize(10).fillColor("#555").text(new Date().toLocaleString());
    doc.moveDown();
    doc.fillColor("#000").fontSize(11);
    for (const row of rows) {
      doc.text(row.join("  ·  "));
    }
  });
}

export async function exportReportExcel(type: ReportType, range: DateRange = {}): Promise<Buffer> {
  const ExcelJS = (await import("exceljs")).default;
  const data = await getReport(type, range);
  const rows = breakdownRows(data);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(REPORT_TITLES[type].slice(0, 31));
  sheet.addRow(["Section", "Field", "Value"]);
  for (const row of rows) sheet.addRow(row);
  sheet.getRow(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export { REPORT_TITLES };
