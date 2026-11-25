import { requirePermission, apiErrorResponse } from "@/lib/api-guard";
import { listAllSubscribersForExport } from "@/lib/services/newsletterService";

export async function GET(req: Request) {
  try {
    await requirePermission(req, "newsletter.view");
    const rows = await listAllSubscribersForExport();
    const csv = ["Email,Active,Source,Subscribed At", ...rows.map((r) => `"${r.email}",${r.isActive},"${r.source ?? ""}",${r.createdAt.toISOString()}`)].join("\n");
    return new Response(csv, {
      headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="newsletter-subscribers.csv"` },
    });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
