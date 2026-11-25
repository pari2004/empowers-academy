"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { sourceLabel, type Lead } from "./types";

export default function LeadCard({ lead }: { lead: Lead }) {
  return (
    <Link
      href={`/admin/leads/${lead.id}`}
      className="block rounded-lg border border-border bg-card p-3 shadow-sm hover:border-primary/50 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium text-sm text-foreground">{lead.name}</span>
        {lead.leadScore > 0 && (
          <Badge variant="secondary" className="shrink-0 text-xs">
            {lead.leadScore}
          </Badge>
        )}
      </div>
      {lead.course && <div className="mt-1 text-xs text-muted-foreground">{lead.course.title}</div>}
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{sourceLabel(lead.source)}</span>
        {lead.nextFollowUpAt && <span>Follow-up {new Date(lead.nextFollowUpAt).toLocaleDateString()}</span>}
      </div>
      {lead.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {lead.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px]">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </Link>
  );
}
