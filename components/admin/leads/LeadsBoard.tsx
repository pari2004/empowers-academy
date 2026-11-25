"use client";

import { useQuery } from "@tanstack/react-query";
import LeadsKanban from "./LeadsKanban";
import type { Lead } from "./types";

export default function LeadsBoard({ assignedToId }: { assignedToId?: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-leads-board", assignedToId],
    queryFn: async () => {
      const params = new URLSearchParams({ pageSize: "500" });
      if (assignedToId) params.set("assignedToId", assignedToId);
      const res = await fetch(`/api/admin/leads?${params}`);
      return (await res.json()) as { items: Lead[] };
    },
  });

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading…</div>;

  return <LeadsKanban leads={data?.items ?? []} />;
}
