"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LEAD_SOURCES, LEAD_STAGES, sourceLabel, stageLabel, type Lead } from "./types";

export default function LeadsTable({ assignedToId }: { assignedToId?: string }) {
  const [page, setPage] = useState(1);
  const [stage, setStage] = useState<string>("");
  const [source, setSource] = useState<string>("");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-leads", page, stage, source, search, assignedToId],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), pageSize: "20" });
      if (stage) params.set("stage", stage);
      if (source) params.set("source", source);
      if (search) params.set("search", search);
      if (assignedToId) params.set("assignedToId", assignedToId);
      const res = await fetch(`/api/admin/leads?${params}`);
      return (await res.json()) as { items: Lead[]; pageCount: number };
    },
  });

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
        <Input
          placeholder="Search name / email / phone…"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="w-64"
        />
        <Select
          value={stage || "ALL"}
          onValueChange={(v) => {
            setPage(1);
            setStage(v === "ALL" ? "" : v);
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All stages</SelectItem>
            {LEAD_STAGES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={source || "ALL"}
          onValueChange={(v) => {
            setPage(1);
            setSource(v === "ALL" ? "" : v);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All sources</SelectItem>
            {LEAD_SOURCES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" asChild className="ml-auto">
          <Link href="/api/admin/leads/export">Export CSV</Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Follow-up</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(data?.items ?? []).map((lead) => (
            <TableRow key={lead.id} className="cursor-pointer">
              <TableCell>
                <Link href={`/admin/leads/${lead.id}`} className="font-medium text-primary hover:underline">
                  {lead.name}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{lead.email ?? lead.phone ?? "—"}</TableCell>
              <TableCell>{lead.course?.title ?? "—"}</TableCell>
              <TableCell>{sourceLabel(lead.source)}</TableCell>
              <TableCell>
                <Badge variant="secondary">{stageLabel(lead.stage)}</Badge>
              </TableCell>
              <TableCell>{lead.leadScore}</TableCell>
              <TableCell>{lead.nextFollowUpAt ? new Date(lead.nextFollowUpAt).toLocaleDateString() : "—"}</TableCell>
              <TableCell>{new Date(lead.createdAt).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {!isLoading && (data?.items.length ?? 0) === 0 && (
        <div className="p-6 text-center text-sm text-muted-foreground">No leads found.</div>
      )}

      <div className="flex items-center justify-between border-t border-border p-3 text-sm">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Previous
        </Button>
        <span className="text-muted-foreground">
          Page {page} of {data?.pageCount ?? 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= (data?.pageCount ?? 1)}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
