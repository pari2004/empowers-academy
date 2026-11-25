/** Shared by every CSV export route (leads, payments, invoices, receipts, refunds, finance reports). */
export function toCsvRow(values: (string | number | null | undefined)[]): string {
  return values.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",");
}

export function toCsv(header: (string | number | null | undefined)[], rows: (string | number | null | undefined)[][]): string {
  return [toCsvRow(header), ...rows.map(toCsvRow)].join("\n");
}

export function csvResponse(csv: string, filename: string): Response {
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
