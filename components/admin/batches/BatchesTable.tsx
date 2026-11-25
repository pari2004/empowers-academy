"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BATCH_STATUSES, batchStatusLabel, type Batch } from "./types";

export default function BatchesTable() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-batches", page, status, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), pageSize: "20" });
      if (status) params.set("status", status);
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/batches?${params}`);
      return (await res.json()) as { items: Batch[]; pageCount: number };
    },
  });

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
        <Input placeholder="Search batch name…" value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} className="w-64" />
        <Select value={status || "ALL"} onValueChange={(v) => { setPage(1); setStatus(v === "ALL" ? "" : v); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {BATCH_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Trainer</TableHead>
            <TableHead>Timing</TableHead>
            <TableHead>Capacity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Start Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(data?.items ?? []).map((batch) => (
            <TableRow key={batch.id}>
              <TableCell>
                <Link href={`/admin/batches/${batch.id}`} className="font-medium text-primary hover:underline">
                  {batch.name}
                </Link>
              </TableCell>
              <TableCell>{batch.course.title}</TableCell>
              <TableCell>{batch.instructor?.name ?? "—"}</TableCell>
              <TableCell className="text-muted-foreground">{batch.timing ?? "—"}</TableCell>
              <TableCell>{batch.capacity}</TableCell>
              <TableCell>
                <Badge variant="secondary">{batchStatusLabel(batch.status)}</Badge>
              </TableCell>
              <TableCell>{batch.startDate ? new Date(batch.startDate).toLocaleDateString() : "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {!isLoading && (data?.items.length ?? 0) === 0 && (
        <div className="p-6 text-center text-sm text-muted-foreground">No batches found.</div>
      )}

      <div className="flex items-center justify-between border-t border-border p-3 text-sm">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Previous
        </Button>
        <span className="text-muted-foreground">
          Page {page} of {data?.pageCount ?? 1}
        </span>
        <Button variant="outline" size="sm" disabled={page >= (data?.pageCount ?? 1)} onClick={() => setPage((p) => p + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
